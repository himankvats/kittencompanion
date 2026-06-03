/**
 * Input validation utilities for the user service. Used before any database
 * operations to enforce data integrity as specified in TDD Section 2.2.
 * See TDD Section 11.1 for security input validation requirements.
 */

export function validateName(name: string): boolean {
  return /^[A-Za-zÀ-ÿ' -]{1,100}$/.test(name);
}

export function validateReminderTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}
