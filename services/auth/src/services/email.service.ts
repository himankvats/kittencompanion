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
    if (!apiKey) {
      // Local dev — skip SendGrid initialisation; OTP will be logged to console
      this.initialized = true;
      return;
    }
    sgMail.setApiKey(apiKey);
    this.initialized = true;
  }

  static async sendOTPEmail(toEmail: string, firstName: string, otpCode: string): Promise<void> {
    this.init();
    if (!process.env.SENDGRID_API_KEY) {
      // Local dev fallback — print OTP to terminal so testers can copy it
      logger.info(`[LOCAL DEV] OTP for ${toEmail}: ${otpCode}`, { toEmail, otpCode });
      console.log(`\n╔══════════════════════════════════╗`);
      console.log(`║  LOCAL OTP for ${toEmail}`);
      console.log(`║  Code: ${otpCode}`);
      console.log(`╚══════════════════════════════════╝\n`);
      return;
    }
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
