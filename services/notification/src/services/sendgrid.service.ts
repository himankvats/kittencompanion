/**
 * SendGrid API integration for the notification service.
 * Wraps @sendgrid/mail with typed parameters.
 * See TDD Section 3.1 for email sending requirements.
 */

import sgMail from '@sendgrid/mail';

let initialized = false;

function init(): void {
  if (initialized) return;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('SENDGRID_API_KEY is not set');
  sgMail.setApiKey(apiKey);
  initialized = true;
}

export class SendGridService {
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    init();
    const from = process.env.SENDGRID_FROM_EMAIL;
    if (!from) throw new Error('SENDGRID_FROM_EMAIL is not set');
    await sgMail.send({ to, from, subject, html: htmlContent, text: textContent });
    console.log(JSON.stringify({ level: 'INFO', message: 'Email sent', to, subject }));
  }
}

export default SendGridService;
