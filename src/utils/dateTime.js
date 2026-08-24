function padTwo(value) {
  return String(value).padStart(2, "0");
}

export function formatDateForDisplay(date) {
  return `${padTwo(date.day)}/${padTwo(date.month)}/${date.year}`;
}

export function formatDateForInput(date) {
  return `${date.year}-${padTwo(date.month)}-${padTwo(date.day)}`;
}

export function formatTime(date) {
  return `${padTwo(date.hour)}:${padTwo(date.minute)}`;
}

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
