import { windowStart, WEEK_MS, FIRST_OPEN_AT } from "@/lib/schedule";

/** Start of the device-limit week (Thursday 14:00 Madrid, same cycle as the mailbox). */
export function deviceWeekStart(now = Date.now()) {
  if (now < FIRST_OPEN_AT) return FIRST_OPEN_AT - WEEK_MS;
  return windowStart(now);
}

export function deviceCanSend(usedThisWeek: number, limit: number) {
  return usedThisWeek < Math.max(0, limit);
}

/** Shared connections (school wifi) get a much higher cap than a single device. */
export const IP_WEEK_MULTIPLIER = 10;
