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
      return google.delivered && google.mailed ? "sent" : "failed";
    } catch (error) {
      console.error("Заявка Google почтасы аркылуу кеткен жок:", error);
      return "failed";
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    console.error("Заявка почтага кеткен жок: GOOGLE_SURVEY_WEBHOOK_URL жана RESEND_API_KEY коюлган эмес");
    return "unconfigured";
  }

  const sent = await deliverForumEmail(`Новая заявка: ${subjectName}`, applicationHtml(application));
  return sent ? "sent" : "failed";
}
