/**
 * Email template service. Provides HTML/text templates for reminder, OTP, and digest emails.
 * See TDD Section 3.1 for template content requirements.
 */

export type TemplateId = 'reminder' | 'otp' | 'digest';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export class TemplateService {
  static getReminderTemplate(petName: string, ownerFirstName: string): EmailTemplate {
    const subject = `Daily check-in reminder for ${petName}`;
    const appUrl = process.env.APP_URL ?? 'https://app.newcatcompanion.com';
    const htmlContent = `
      <p>Hi ${ownerFirstName},</p>
      <p>Don't forget to log ${petName}'s daily check-in today! Tracking eating, litter, and activity helps you spot patterns early.</p>
      <p><a href="${appUrl}/checkin">Log today's check-in →</a></p>
    `;
    const textContent = `Hi ${ownerFirstName},\n\nDon't forget to log ${petName}'s daily check-in today!\n\nVisit: ${appUrl}/checkin`;
    return { subject, htmlContent, textContent };
  }

  static getOTPTemplate(firstName: string, otpCode: string): EmailTemplate {
    const subject = 'Your One-Time Code for New Cat Companion';
    const htmlContent = `
      <p>Hi ${firstName},</p>
      <p>Your verification code is: <strong>${otpCode}</strong></p>
      <p>This code is valid for 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    const textContent = `Hi ${firstName},\n\nYour verification code is: ${otpCode}\n\nThis code is valid for 24 hours.\n\nIf you did not request this, please ignore this email.`;
    return { subject, htmlContent, textContent };
  }

  static getDigestTemplate(petName: string, digestText: string): EmailTemplate {
    const subject = `Weekly digest for ${petName}`;
    const htmlContent = `
      <p>Here's ${petName}'s weekly behavioral summary:</p>
      <div style="background:#f9f9f9;padding:16px;border-radius:4px;">
        ${digestText.replace(/\n/g, '<br>')}
      </div>
      <p>Keep up the great work tracking ${petName}'s health!</p>
    `;
    const textContent = `Here's ${petName}'s weekly behavioral summary:\n\n${digestText}\n\nKeep up the great work tracking ${petName}'s health!`;
    return { subject, htmlContent, textContent };
  }

  static getTemplate(templateId: TemplateId, data: Record<string, unknown>): EmailTemplate {
    switch (templateId) {
      case 'reminder':
        return this.getReminderTemplate(data.petName as string, data.ownerFirstName as string);
      case 'otp':
        return this.getOTPTemplate(data.firstName as string, data.otpCode as string);
      case 'digest':
        return this.getDigestTemplate(data.petName as string, data.digestText as string);
      default:
        throw new Error(`Unknown templateId: ${templateId}`);
    }
  }
}

export default TemplateService;
