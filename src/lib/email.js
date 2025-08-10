import Postmark from "postmark";

const { POSTMARK_TOKEN, FROM_EMAIL, NOTIFY_TO } = process.env;
let client = null;
if (POSTMARK_TOKEN) {
  client = new Postmark.ServerClient(POSTMARK_TOKEN);
}

export async function sendEmail(subject, htmlBody) {
  if (!client) return;
  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: NOTIFY_TO,
      Subject: subject,
      HtmlBody: htmlBody,
    });
  } catch (e) {
    console.warn("Email send failed:", e?.message || e);
  }
}
