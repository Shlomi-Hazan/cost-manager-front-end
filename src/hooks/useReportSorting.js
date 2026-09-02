import { useMemo, useState } from 'react';
import {
  REPORT_SORT_DIRECTIONS,
  sortReportCosts
} from '../utils/reportSorting.js';

// TEAM EXTENSION: React state wrapper around sortReportCosts() shared by
// the Monthly and Yearly report pages, so both get identical column-header
// click behavior "for free" instead of reimplementing it twice.
export function useReportSorting(costs) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(REPORT_SORT_DIRECTIONS.asc);

  const sortedCosts = useMemo(() => {
    return sortReportCosts(costs, { sortKey, sortDirection });
  }, [costs, sortDirection, sortKey]);

  // Clicking a new column starts it at ascending; clicking the SAME column
  // again toggles between ascending/descending — the standard sortable-
  // table interaction pattern.
  function requestSort(nextSortKey) {
    if (sortKey !== nextSortKey) {
      setSortKey(nextSortKey);
      setSortDirection(REPORT_SORT_DIRECTIONS.asc);
      return;
    }

    setSortDirection((currentDirection) => {
      return currentDirection === REPORT_SORT_DIRECTIONS.asc
        ? REPORT_SORT_DIRECTIONS.desc
        : REPORT_SORT_DIRECTIONS.asc;
    });
  }

  function resetSort() {
    setSortKey(null);
    setSortDirection(REPORT_SORT_DIRECTIONS.asc);
  }

  return {
    sortedCosts,
    sortDirection,
    sortKey,
    requestSort,
    resetSort
  };
}
