/**
 * SQS consumer helper for the notification service.
 * Provides utilities for parsing and acknowledging SQS messages.
 * See TDD Section 3.1 and infrastructure SQS queues (TDD Section 8.1).
 */

import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(process.env.LOCALSTACK_ENDPOINT ? { endpoint: process.env.LOCALSTACK_ENDPOINT } : {}),
});

export class QueueService {
  static parseMessage<T>(body: string): T {
    return JSON.parse(body) as T;
  }

  static async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    }));
  }
}

export default QueueService;
