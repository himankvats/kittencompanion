/**
 * Generic email sender invoked from SQS messages. Extracts email parameters
 * from the SQS message body and dispatches via SendGrid.
 * See TDD Section 3.1 for notification flow.
 */

import { SQSRecord } from 'aws-lambda';
import { SendGridService } from '../services/sendgrid.service';
import { TemplateService, TemplateId } from '../services/template.service';
import { QueueService } from '../services/queue.service';

export interface EmailPayload {
  to: string;
  templateId: TemplateId;
  templateData: Record<string, unknown>;
}

export async function sendEmailHandler(record: SQSRecord): Promise<void> {
  try {
    const payload = QueueService.parseMessage<EmailPayload>(record.body);
    const { subject, htmlContent, textContent } = TemplateService.getTemplate(
      payload.templateId,
      payload.templateData
    );
    await SendGridService.sendEmail(payload.to, subject, htmlContent, textContent);
  } catch (err) {
    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Failed to send email',
      error: String(err),
      messageId: record.messageId,
    }));
    // Do NOT re-throw — SQS retry policy handles retries
  }
}

export default sendEmailHandler;
