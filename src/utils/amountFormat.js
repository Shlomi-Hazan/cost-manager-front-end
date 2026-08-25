export function formatDisplayAmount(amount) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString("en-US", {
        maximumFractionDigits: 6
      });
}

export function formatDisplayPercentage(ratio) {
  return `${(ratio * 100).toLocaleString("en-US", {
    maximumFractionDigits: 1
  })}%`;
}
