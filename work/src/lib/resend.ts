import { getEnv } from './env';

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error('Resend is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${body}`);
  }
}

export function magicLinkEmailHtml(verifyUrl: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Inter, Segoe UI, sans-serif; color: #1a202c; line-height: 1.5;">
    <p>Sign in to the Mr Demo Pro admin portal:</p>
    <p>
      <a href="${verifyUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
        Open magic link
      </a>
    </p>
    <p style="color:#4a5568;font-size:13px;">This link expires in 20 minutes. If you did not request it, ignore this email.</p>
  </body>
</html>`;
}
