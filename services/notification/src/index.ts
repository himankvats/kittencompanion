/**
 * Notification Lambda entry point. Triggered by SQS messages or EventBridge schedule.
 * Routes to sendReminder (daily check-in reminders) or sendEmail (transactional emails).
 * See TDD Section 3.1 for notification flow specification.
 */

import { SQSEvent, ScheduledEvent } from 'aws-lambda';
import { sendReminderHandler } from './handlers/sendReminder';
import { sendEmailHandler } from './handlers/sendEmail';

type NotificationEvent = SQSEvent | ScheduledEvent;

export const handler = async (event: NotificationEvent): Promise<void> => {
  if ('Records' in event && Array.isArray(event.Records)) {
    // SQS trigger — process each record
    await Promise.all(event.Records.map(record => sendEmailHandler(record)));
  } else {
    // EventBridge scheduled trigger
    await sendReminderHandler(event as ScheduledEvent);
  }
};

export default handler;
