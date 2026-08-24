export const REPORT_SORT_DIRECTIONS = {
  asc: "asc",
  desc: "desc"
};

export const REPORT_SORT_KEYS = {
  date: "date",
  time: "time",
  description: "description",
  category: "category",
  sum: "sum",
  currency: "currency"
};

const textCompareOptions = {
  sensitivity: "base"
};

function compareNumbers(left, right) {
  return left - right;
}

function getDateValue(cost) {
  return cost.date.year * 10000 + cost.date.month * 100 + cost.date.day;
}

function getTimeValue(cost) {
  return cost.date.hour * 60 + cost.date.minute;
}

function compareText(left, right) {
  return left.localeCompare(right, "en", textCompareOptions);
}

function compareByKey(leftCost, rightCost, sortKey) {
  switch (sortKey) {
    case REPORT_SORT_KEYS.date:
      return compareNumbers(getDateValue(leftCost), getDateValue(rightCost));
    case REPORT_SORT_KEYS.time:
      return compareNumbers(getTimeValue(leftCost), getTimeValue(rightCost));
    case REPORT_SORT_KEYS.description:
      return compareText(leftCost.description, rightCost.description);
    case REPORT_SORT_KEYS.category:
      return compareText(leftCost.category, rightCost.category);
    case REPORT_SORT_KEYS.sum:
      return compareNumbers(leftCost.sum, rightCost.sum);
    case REPORT_SORT_KEYS.currency:
      return compareText(leftCost.currency, rightCost.currency);
    default:
      throw new TypeError("Unsupported report sort key.");
  }
}

export function sortReportCosts(costs, { sortKey = null, sortDirection = "asc" } = {}) {
  if (sortKey === null) {
    return [...costs];
  }

  if (!Object.values(REPORT_SORT_DIRECTIONS).includes(sortDirection)) {
    throw new TypeError("Unsupported report sort direction.");
  }

  const directionFactor =
    sortDirection === REPORT_SORT_DIRECTIONS.asc ? 1 : -1;

  return costs
    .map((cost, index) => ({ cost, index }))
    .sort((left, right) => {
      const comparison = compareByKey(left.cost, right.cost, sortKey);

      if (comparison !== 0) {
        return comparison * directionFactor;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.cost);
}
