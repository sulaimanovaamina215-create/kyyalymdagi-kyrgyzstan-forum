import { spawn } from "node:child_process";
import net from "node:net";
import { countWords, type Application } from "@/lib/application";
import { forumNotifyEmail, googleSurveyConfigured, pushToGoogle } from "@/lib/google-survey";
import { deliverForumEmail, escapeHtml } from "@/lib/notify";

const HOST_FROM = "noreply@jashtyk.kg";

export type ApplicationMailResult = "sent" | "unconfigured" | "failed";

function applicationHtml(application: Application) {
  const words = countWords(application.letter);
  const letter = escapeHtml(application.letter).replaceAll("\n", "<br />");
  return `
    <h2>Новая заявка на участие</h2>
    <p><strong>ФИО:</strong> ${escapeHtml(application.fullName)}</p>
    <p><strong>WhatsApp:</strong> ${escapeHtml(application.phone)}</p>
    <p><strong>Мотивационное письмо</strong> (${words} слов):</p>
    <p>${letter}</p>
  `;
}

export async function sendApplicationNotice(application: Application): Promise<ApplicationMailResult> {
  const subjectName = application.fullName.replace(/[\r\n]+/g, " ").slice(0, 80);

  if (googleSurveyConfigured()) {
    try {
      const google = await pushToGoogle({
        kind: "application",
        application: {
          fullName: application.fullName,
          phone: application.phone,
          letter: application.letter,
          words: countWords(application.letter),
        },
      });
      if (google.delivered && google.mailed) return "sent";
    } catch (error) {
      console.error("Заявка Google почтасы аркылуу кеткен жок:", error);
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (apiKey && from) {
    const sent = await deliverForumEmail(`Новая заявка: ${subjectName}`, applicationHtml(application));
    if (sent) return "sent";
  }

  const hosted = await sendByHosting(`Новая заявка: ${subjectName}`, applicationText(application));
  if (hosted) return "sent";

  return "unconfigured";
}

function applicationText(application: Application) {
  return [
    "Новая заявка на участие «Кыялымдагы Кыргызстан».",
    "",
    `ФИО: ${application.fullName.replace(/[\r\n]+/g, " ")}`,
    `WhatsApp: ${application.phone.replace(/[\r\n]+/g, " ")}`,
    `Слов: ${countWords(application.letter)}`,
    "",
    "Мотивационное письмо:",
    application.letter,
  ].join("\n");
}

function hostingRaw(subject: string, text: string) {
  const encoded = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
  const body = text.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
  return [
    `To: ${forumNotifyEmail}`,
    `From: ${HOST_FROM}`,
    `Subject: ${encoded}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

async function sendByHosting(subject: string, text: string) {
  const raw = hostingRaw(subject, text);
  for (const binary of ["/usr/sbin/sendmail", "/usr/lib/sendmail", "sendmail"]) {
    if (await sendBySendmail(binary, raw)) return true;
  }
  return sendByLocalSmtp(raw);
}

function sendBySendmail(binary: string, raw: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(binary, ["-t", "-i"], { stdio: ["pipe", "ignore", "ignore"] });
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(false);
    }, 8000);
    child.on("error", () => {
      clearTimeout(timer);
      finish(false);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      finish(code === 0);
    });
    child.stdin.end(raw);
  });
}

function sendByLocalSmtp(raw: string) {
  return new Promise<boolean>((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port: 25 });
    let buffer = "";
    let step = 0;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 8000);
    const write = (line: string) => socket.write(`${line}\r\n`);
    socket.on("error", () => finish(false));
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      const reply = finalReply(buffer);
      if (!reply) return;
      buffer = reply.rest;
      const { code } = reply;
      if (step === 0 && code === 220) {
        step = 1;
        write("EHLO jashtyk.kg");
      } else if (step === 1 && code === 250) {
        step = 2;
        write(`MAIL FROM:<${HOST_FROM}>`);
      } else if (step === 2 && code === 250) {
        step = 3;
        write(`RCPT TO:<${forumNotifyEmail}>`);
      } else if (step === 3 && code === 250) {
        step = 4;
        write("DATA");
      } else if (step === 4 && code === 354) {
        step = 5;
        socket.write(`${raw}\r\n.\r\n`);
      } else if (step === 5 && code === 250) {
        write("QUIT");
        finish(true);
      } else if (code >= 400) {
        finish(false);
      }
    });
  });
}

function finalReply(buffer: string) {
  if (!buffer.endsWith("\n")) return null;
  const lines = buffer.split(/\r?\n/).filter((line) => line.length > 0);
  const last = lines.at(-1) ?? "";
  if (last.length < 4 || last[3] === "-") return null;
  const code = Number(last.slice(0, 3));
  if (!Number.isFinite(code)) return null;
  return { code, rest: "" };
}
