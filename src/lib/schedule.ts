// Weekly submission window: opens Thursday 22 Oct 2026 14:00 CEST (12:00 UTC), then every 7 days.
export const FIRST_OPEN_AT = Date.parse("2026-10-22T12:00:00Z");
export const REQUEST_LIMIT = 30;
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function windowStart(now = Date.now()) {
  if (now < FIRST_OPEN_AT) return FIRST_OPEN_AT;
  return FIRST_OPEN_AT + Math.floor((now - FIRST_OPEN_AT) / WEEK_MS) * WEEK_MS;
}

export function nextUnlockAt(now = Date.now()) {
  if (now < FIRST_OPEN_AT) return FIRST_OPEN_AT;
  return FIRST_OPEN_AT + (Math.floor((now - FIRST_OPEN_AT) / WEEK_MS) + 1) * WEEK_MS;
}
