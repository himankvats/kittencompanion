/**
 * SQS consumer helper for the notification service.
 * Provides utilities for parsing and acknowledging SQS messages.
 * See TDD Section 3.1 and infrastructure SQS queues (TDD Section 8.1).
 */

import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  // TODO: Add endpoint override for LocalStack in local dev (TDD Section 8.1)
});

// TODO: Implement parseMessage (TDD Section 3.1)
// Safely parses the SQS message body as the given type
export function parseMessage<T>(body: string): T {
  throw new Error('Not implemented - see TDD Section 3.1');
}

// TODO: Implement deleteMessage (TDD Section 3.1)
// Deletes a successfully processed message from SQS
export async function deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
  throw new Error('Not implemented - see TDD Section 3.1');
}

export { sqsClient };
