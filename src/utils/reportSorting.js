/*
 * TEAM EXTENSION (X-006): sortable Monthly/Yearly report tables. Sorting
 * never mutates the source cost array or affects the report's calculated
 * total — it only changes the on-screen row order. A stable sort (see the
 * `index` tie-breaker below) keeps equal-valued rows in their original
 * order instead of shuffling them on every sort request.
 */

export const REPORT_SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc'
};

export const REPORT_SORT_KEYS = {
  date: 'date',
  time: 'time',
  description: 'description',
  category: 'category',
  sum: 'sum',
  currency: 'currency'
};

const textCompareOptions = {
  sensitivity: 'base'
};

function compareNumbers(left, right) {
  return left - right;
}

// Encodes year/month/day into one comparable integer (e.g. 2026-08-29 ->
// 20260829) so chronological order is just numeric order, without needing
// a full Date object or timezone handling.
function getDateValue(cost) {
  return cost.date.year * 10000 + cost.date.month * 100 + cost.date.day;
}

function getTimeValue(cost) {
  return cost.date.hour * 60 + cost.date.minute;
}

function compareText(left, right) {
  return left.localeCompare(right, 'en', textCompareOptions);
}

// Dispatches to the right comparator for one sort key; direction/tie-break
// are applied by the caller (sortReportCosts) so this stays a pure compare.
function compareByKey(leftCost, rightCost, sortKey) {
  switch (sortKey) {
    case REPORT_SORT_KEYS.date:
      return compareNumbers(getDateValue(leftCost), getDateValue(rightCost));
    case REPORT_SORT_KEYS.time:
      return compareNumbers(getTimeValue(leftCost), getTimeValue(rightCost));
    case REPORT_SORT_KEYS.description:
      return compareText(leftCost.description, rightCost.description);
    // Remaining text/numeric columns follow the same pattern above.
    case REPORT_SORT_KEYS.category:
      return compareText(leftCost.category, rightCost.category);
    case REPORT_SORT_KEYS.sum:
      return compareNumbers(leftCost.sum, rightCost.sum);
    case REPORT_SORT_KEYS.currency:
      return compareText(leftCost.currency, rightCost.currency);
    default:
      throw new TypeError('Unsupported report sort key.');
  }
}

/**
 * Returns a NEW sorted array; `costs` itself is never reordered in place.
 * @param {object[]} costs - Costs to sort.
 * @param {object} [options]
 * @param {?string} [options.sortKey] - One of REPORT_SORT_KEYS, or null for
 *   "no sorting requested yet" (returns a shallow copy in insertion order).
 * @param {string} [options.sortDirection] - One of REPORT_SORT_DIRECTIONS.
 * @returns {object[]} A new, sorted (or copied) array.
 */
export function sortReportCosts(costs, { sortKey = null, sortDirection = 'asc' } = {}) {
  if (sortKey === null) {
    return [...costs];
  }

  if (!Object.values(REPORT_SORT_DIRECTIONS).includes(sortDirection)) {
    throw new TypeError('Unsupported report sort direction.');
  }

  const directionFactor =
    sortDirection === REPORT_SORT_DIRECTIONS.asc ? 1 : -1;

  // Pairing each cost with its original index lets ties fall back to
  // insertion order (left.index - right.index) instead of an unspecified
  // order, which is what makes this sort stable.
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
