/*
 * Formatting/parsing helpers for the { day, month, year, hour, minute } date
 * shape stored by db.js (see src/lib/db.js). Kept separate from db.js itself
 * so the storage layer has no knowledge of how dates are displayed or how
 * HTML date/time <input> values are parsed back into that shape.
 */

function padTwo(value) {
  return String(value).padStart(2, '0');
}

/**
 * @param {object} date - { day, month, year, ... } as stored by db.js.
 * @returns {string} date formatted as dd/mm/yyyy.
 */
export function formatDateForDisplay(date) {
  return `${padTwo(date.day)}/${padTwo(date.month)}/${date.year}`;
}

/**
 * @param {object} date - { day, month, year, ... } as stored by db.js.
 * @returns {string} date formatted as yyyy-mm-dd, the shape HTML
 *   <input type="date"> requires.
 */
export function formatDateForInput(date) {
  return `${date.year}-${padTwo(date.month)}-${padTwo(date.day)}`;
}

/**
 * @param {object} date - { hour, minute, ... } as stored by db.js.
 * @returns {string} date's time formatted as HH:mm.
 */
export function formatTime(date) {
  return `${padTwo(date.hour)}:${padTwo(date.minute)}`;
}

/**
 * Parses an <input type="date"> value back into { day, month, year }. This
 * performs only a cheap range check (day 1-31) — the authoritative "is this
 * a real calendar date" check (e.g. rejecting 31 February) lives in db.js's
 * isRealCalendarDate(), which runs when the edit is actually saved.
 * @param {string} value - Raw <input type="date"> value.
 * @returns {{day: number, month: number, year: number}|null} Parsed date,
 *   or null if value does not match the expected shape or is out of range.
 */
export function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  // Reject out-of-range values; this is a lightweight sanity check, not a
  // full calendar validation (no Feb-30 detection).
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

/**
 * Same idea as parseDateInput(), for an <input type="time"> value.
 * @param {string} value - Raw <input type="time"> value.
 * @returns {{hour: number, minute: number}|null} Parsed time, or null if
 *   value does not match the expected shape or is out of range.
 */
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
