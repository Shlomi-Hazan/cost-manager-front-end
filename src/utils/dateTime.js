/*
 * Formatting/parsing helpers for the { day, month, year, hour, minute } date
 * shape stored by db.js (see src/lib/db.js). Kept separate from db.js itself
 * so the storage layer has no knowledge of how dates are displayed or how
 * HTML date/time <input> values are parsed back into that shape.
 */

function padTwo(value) {
  return String(value).padStart(2, "0");
}

export function formatDateForDisplay(date) {
  return `${padTwo(date.day)}/${padTwo(date.month)}/${date.year}`;
}

// HTML <input type="date"> requires exactly this yyyy-mm-dd shape.
export function formatDateForInput(date) {
  return `${date.year}-${padTwo(date.month)}-${padTwo(date.day)}`;
}

export function formatTime(date) {
  return `${padTwo(date.hour)}:${padTwo(date.minute)}`;
}

// Parses an <input type="date"> value back into { day, month, year}.
// Returns null (rather than throwing) for anything that does not match the
// expected shape or contains an out-of-range month/day, so the Manage Costs
// edit form can show a friendly validation message instead of crashing.
// This performs only a cheap range check (day 1-31) — the authoritative
// "is this a real calendar date" check (e.g. rejecting 31 February) lives in
// db.js's isRealCalendarDate(), which runs when the edit is actually saved.
export function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return {
    day,
    month,
    year
  };
}

// Same idea as parseDateInput(), for an <input type="time"> value.
export function parseTimeInput(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, hourValue, minuteValue] = match;
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return {
    hour,
    minute
  };
}
