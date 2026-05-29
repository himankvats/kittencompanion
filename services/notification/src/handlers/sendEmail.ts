/**
 * Generic email sender invoked from SQS messages. Extracts email parameters
 * from the SQS message body and dispatches via SendGrid.
 * See TDD Section 3.1 for notification flow.
 */

import { SQSRecord, Context } from 'aws-lambda';
import { SendGridService } from '../services/sendgrid.service';
import { TemplateService } from '../services/template.service';

export interface EmailPayload {
  to: string;
  templateId: string;     // reminder | otp | digest
  templateData: Record<string, unknown>;
}

// TODO: Implement sendEmailHandler (TDD Section 3.1)
// Steps:
//   1. Parse SQS record body as EmailPayload
//   2. Build email from TemplateService.getTemplate(templateId, templateData)
//   3. Send via SendGridService.sendEmail
//   4. Handle failures gracefully (do not throw — log and continue)
export async function sendEmailHandler(record: SQSRecord): Promise<void> {
  throw new Error('Not implemented - see TDD Section 3.1');
}

export default sendEmailHandler;
