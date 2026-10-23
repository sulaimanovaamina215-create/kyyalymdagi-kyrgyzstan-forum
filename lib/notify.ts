import { Resend } from "resend";
import { forumNotifyEmail } from "@/lib/google-survey";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendForumEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey) {
    console.error("Resend аркылуу кат жөнөтүүдө ката чыкты: RESEND_API_KEY коюлган эмес");
    return;
  }
  if (!from) {
    console.error("Resend аркылуу кат жөнөтүүдө ката чыкты: RESEND_FROM коюлган эмес");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to: forumNotifyEmail, subject, html });
    if (error) console.error("Resend аркылуу кат жөнөтүүдө ката чыкты:", error);
  } catch (emailError) {
    console.error("Resend аркылуу кат жөнөтүүдө ката чыкты:", emailError);
  }
}
