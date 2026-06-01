/**
 * EmailService — sends transactional emails via the SendGrid API.
 * Currently supports OTP delivery for signup/login flows.
 * See TDD Section 3.1 for email template specification.
 */

import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';

export class EmailService {
  private static initialized = false;

  private static init(): void {
    if (this.initialized) return;
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY is not set');
    sgMail.setApiKey(apiKey);
    this.initialized = true;
  }

  static async sendOTPEmail(toEmail: string, firstName: string, otpCode: string): Promise<void> {
    this.init();
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) throw new Error('SENDGRID_FROM_EMAIL is not set');

    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject: 'Your One-Time Code for New Cat Companion',
      text: `Hi ${firstName},\n\nYour verification code is: ${otpCode}\n\nThis code is valid for 24 hours.\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hi ${firstName},</p><p>Your verification code is: <strong>${otpCode}</strong></p><p>This code is valid for 24 hours.</p>`,
    });
    logger.info('OTP email sent', { toEmail });
  }

  // TODO: Implement sendDeletionConfirmationEmail (TDD Section 2.2.3)
  static async sendDeletionConfirmationEmail(
    _toEmail: string,
    _firstName: string,
    _confirmationToken: string
  ): Promise<void> {
    throw new Error('Not implemented - see TDD Section 2.2.3');
  }
}

export default EmailService;
