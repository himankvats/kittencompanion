import { sendEmailHandler } from '../../src/handlers/sendEmail';
import { SendGridService } from '../../src/services/sendgrid.service';
import { TemplateService } from '../../src/services/template.service';
import { SQSRecord } from 'aws-lambda';

jest.mock('../../src/services/sendgrid.service');
// queue.service is pure JSON.parse — no need to mock it

const mockSendEmail = SendGridService.sendEmail as jest.MockedFunction<typeof SendGridService.sendEmail>;

function makeRecord(body: object): SQSRecord {
  return {
    messageId: 'msg-1',
    receiptHandle: 'rh-1',
    body: JSON.stringify(body),
    attributes: {} as any,
    messageAttributes: {},
    md5OfBody: '',
    eventSource: 'aws:sqs',
    eventSourceARN: '',
    awsRegion: 'us-east-1',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSendEmail.mockResolvedValue(undefined);
});

describe('sendEmailHandler', () => {
  it('calls SendGridService with correct args from reminder payload', async () => {
    const record = makeRecord({
      to: 'owner@example.com',
      templateId: 'reminder',
      templateData: { petName: 'Scooter', ownerFirstName: 'Jane' },
    });

    await sendEmailHandler(record);

    expect(mockSendEmail).toHaveBeenCalledWith(
      'owner@example.com',
      expect.stringContaining('Scooter'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('calls TemplateService.getTemplate with correct templateId and data', async () => {
    const getTemplateSpy = jest.spyOn(TemplateService, 'getTemplate');
    const record = makeRecord({
      to: 'owner@example.com',
      templateId: 'otp',
      templateData: { firstName: 'Jane', otpCode: '123456' },
    });

    await sendEmailHandler(record);

    expect(getTemplateSpy).toHaveBeenCalledWith('otp', { firstName: 'Jane', otpCode: '123456' });
  });

  it('does NOT throw when SendGrid fails (swallows error)', async () => {
    mockSendEmail.mockRejectedValue(new Error('SendGrid down'));
    const record = makeRecord({
      to: 'owner@example.com',
      templateId: 'reminder',
      templateData: { petName: 'Scooter', ownerFirstName: 'Jane' },
    });

    await expect(sendEmailHandler(record)).resolves.toBeUndefined();
  });
});
