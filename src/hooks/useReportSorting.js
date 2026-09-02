import { useMemo, useState } from 'react';
import {
  reportSortDirections,
  sortReportCosts
} from '../utils/reportSorting.js';

// TEAM EXTENSION: React state wrapper around sortReportCosts() shared by
// the Monthly and Yearly report pages, so both get identical column-header
// click behavior "for free" instead of reimplementing it twice.
export function useReportSorting(costs) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(reportSortDirections.asc);

  const sortedCosts = useMemo(() => {
    return sortReportCosts(costs, { sortKey, sortDirection });
  }, [costs, sortDirection, sortKey]);

  // Clicking a new column starts it at ascending; clicking the SAME column
  // again toggles between ascending/descending — the standard sortable-
  // table interaction pattern.
  function requestSort(nextSortKey) {
    if (sortKey !== nextSortKey) {
      setSortKey(nextSortKey);
      setSortDirection(reportSortDirections.asc);
      return;
    }

    setSortDirection((currentDirection) => {
      return currentDirection === reportSortDirections.asc
        ? reportSortDirections.desc
        : reportSortDirections.asc;
    });
  }

  function resetSort() {
    setSortKey(null);
    setSortDirection(reportSortDirections.asc);
  }

  return {
    sortedCosts,
    sortDirection,
    sortKey,
    requestSort,
    resetSort
  };
}
