import { countWords, type Application } from "@/lib/application";
import { googleSurveyConfigured, pushToGoogle } from "@/lib/google-survey";
import { deliverForumEmail, escapeHtml } from "@/lib/notify";

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

  return "unconfigured";
}
