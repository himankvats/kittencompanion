/**
 * EmailService — sends transactional emails via the SendGrid API.
 * Handles deletion confirmation emails for the account deletion flow.
 * See TDD Section 2.2.3 for deletion email specification.
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

  static async sendDeletionConfirmationEmail(
    toEmail: string,
    firstName: string,
    confirmationToken: string
  ): Promise<void> {
    this.init();
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) throw new Error('SENDGRID_FROM_EMAIL is not set');

    const appUrl = process.env.APP_URL ?? 'https://app.newcatcompanion.com';
    const confirmUrl = `${appUrl}/confirm-deletion?token=${confirmationToken}`;

    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject: 'Confirm Account Deletion — New Cat Companion',
      text: `Hi ${firstName},\n\nWe received a request to permanently delete your New Cat Companion account and all associated data.\n\nTo confirm, use this token: ${confirmationToken}\n\nOr click here: ${confirmUrl}\n\nThis link is valid for 24 hours. If you did not request this, please ignore this email — your account will not be deleted.`,
      html: `<p>Hi ${firstName},</p><p>We received a request to permanently delete your New Cat Companion account and all associated data (pets, check-ins, health events).</p><p><a href="${confirmUrl}">Confirm Account Deletion</a></p><p>Or use this token: <strong>${confirmationToken}</strong></p><p>This link is valid for 24 hours. If you did not request this, please ignore this email — your account will not be deleted.</p>`,
    });
    logger.info('Deletion confirmation email sent', { toEmail });
  }
}

export default EmailService;
