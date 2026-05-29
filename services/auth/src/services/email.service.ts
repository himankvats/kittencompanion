/**
 * EmailService — sends transactional emails via the SendGrid API.
 * Currently supports OTP delivery for signup/login flows.
 * See TDD Section 3.1 for email template specification.
 */

import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';

export class EmailService {
  // TODO: Implement sendOTPEmail (TDD Section 3.1)
  // Uses SendGrid API (SENDGRID_API_KEY env var)
  // Template from TDD Section 2.1.1 — includes OTP code and verify link
  // Subject: "Your One-Time Code for New Cat Companion"
  static async sendOTPEmail(
    toEmail: string,
    firstName: string,
    otpCode: string
  ): Promise<void> {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement sendDeletionConfirmationEmail (TDD Section 2.2.3)
  // Sends a deletion confirmation link to the user before hard-deleting their data
  static async sendDeletionConfirmationEmail(
    toEmail: string,
    firstName: string,
    confirmationToken: string
  ): Promise<void> {
    throw new Error('Not implemented - see TDD Section 2.2.3');
  }
}

export default EmailService;
