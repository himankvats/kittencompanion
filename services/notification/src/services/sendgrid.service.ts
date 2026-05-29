/**
 * SendGrid API integration for the notification service.
 * Wraps @sendgrid/mail with typed parameters.
 * See TDD Section 3.1 for email sending requirements.
 */

import sgMail from '@sendgrid/mail';

export class SendGridService {
  // TODO: Implement sendEmail (TDD Section 3.1)
  // Uses SENDGRID_API_KEY env var; logs success/failure without throwing
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    throw new Error('Not implemented - see TDD Section 3.1');
  }
}

export default SendGridService;
