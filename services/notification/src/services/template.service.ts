/**
 * Email template service. Provides HTML/text templates for reminder, OTP, and digest emails.
 * See TDD Section 3.1 for template content requirements.
 */

export type TemplateId = 'reminder' | 'otp' | 'digest';

export class TemplateService {
  // TODO: Implement getTemplate (TDD Section 3.1)
  // Returns { subject, htmlContent, textContent } for the given templateId and data
  static getTemplate(
    templateId: TemplateId,
    data: Record<string, unknown>
  ): { subject: string; htmlContent: string; textContent: string } {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement getReminderTemplate (TDD Section 3.1)
  static getReminderTemplate(petName: string, ownerFirstName: string): string {
    throw new Error('Not implemented - see TDD Section 3.1');
  }

  // TODO: Implement getOTPTemplate (TDD Section 2.1.1)
  // Template content defined in TDD Section 2.1.1
  static getOTPTemplate(firstName: string, otpCode: string): string {
    throw new Error('Not implemented - see TDD Section 2.1.1');
  }

  // TODO: Implement getDigestTemplate (TDD Section 4.3)
  static getDigestTemplate(petName: string, digestText: string): string {
    throw new Error('Not implemented - see TDD Section 4.3');
  }
}

export default TemplateService;
