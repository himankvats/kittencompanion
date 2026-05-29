/**
 * Notification Lambda entry point. Triggered by SQS messages or EventBridge schedule.
 * Routes to sendReminder (daily check-in reminders) or sendEmail (transactional emails).
 * See TDD Section 3.1 for notification flow specification.
 */

import { SQSEvent, ScheduledEvent, Context } from 'aws-lambda';
import { sendReminderHandler } from './handlers/sendReminder';
import { sendEmailHandler } from './handlers/sendEmail';

type NotificationEvent = SQSEvent | ScheduledEvent;

// TODO: Implement handler routing (TDD Section 3.1)
// - SQSEvent: process each record and call sendEmailHandler
// - ScheduledEvent (EventBridge): call sendReminderHandler for all due users
export const handler = async (
  event: NotificationEvent,
  context: Context
): Promise<void> => {
  throw new Error('Not implemented - see TDD Section 3.1');
};

export default handler;
