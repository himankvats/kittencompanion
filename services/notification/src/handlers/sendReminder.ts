/**
 * Handles daily check-in reminder delivery. Queries users with reminders due
 * based on their notification_preferences, then sends via SendGrid.
 * See TDD Section 3.1 for reminder specification.
 */

import { ScheduledEvent } from 'aws-lambda';
import { Pool } from 'pg';
import { SendGridService } from '../services/sendgrid.service';
import { TemplateService } from '../services/template.service';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
});

export async function sendReminderHandler(_event: ScheduledEvent): Promise<void> {
  const now = new Date();
  const currentHour = now.getUTCHours().toString().padStart(2, '0') + ':00';

  // Query users who have notifications enabled, reminder_time matches current hour,
  // and haven't submitted a check-in today for at least one of their pets
  const result = await pool.query<{
    email: string;
    first_name: string;
    pet_name: string;
  }>(`
    SELECT DISTINCT u.email, u.first_name, p.name as pet_name
    FROM users u
    JOIN pets p ON p.user_id = u.id AND p.deleted_at IS NULL
    WHERE u.deleted_at IS NULL
      AND (u.notification_preferences->>'enabled')::boolean = true
      AND u.notification_preferences->>'reminder_time' LIKE $1
      AND NOT EXISTS (
        SELECT 1 FROM checkins c
        WHERE c.pet_id = p.id
          AND c.date = CURRENT_DATE
      )
  `, [currentHour + '%']);

  let sent = 0;
  for (const row of result.rows) {
    try {
      const { subject, htmlContent, textContent } = TemplateService.getReminderTemplate(
        row.pet_name,
        row.first_name
      );
      await SendGridService.sendEmail(row.email, subject, htmlContent, textContent);
      sent++;
    } catch (err) {
      console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Failed to send reminder',
        email: row.email,
        error: String(err),
      }));
    }
  }

  console.log(JSON.stringify({
    level: 'INFO',
    message: 'Reminder batch complete',
    sent,
    total: result.rows.length,
  }));
}

export default sendReminderHandler;
