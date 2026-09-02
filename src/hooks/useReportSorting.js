import { useMemo, useState } from 'react';
import {
  reportSortDirections,
  sortReportCosts
} from '../utils/reportSorting.js';

// TEAM EXTENSION: React state wrapper around sortReportCosts() shared by
// the Monthly and Yearly report pages, so both get identical column-header
// click behavior "for free" instead of reimplementing it twice.
export function useReportSorting(costs) {
  // null sortKey means "unsorted" (insertion order); see sortReportCosts().
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(reportSortDirections.asc);

  // Recomputed only when costs/sortKey/sortDirection actually change, not
  // on every render, since sorting a large list is not free.
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

  // Called by report pages whenever the underlying report is regenerated,
  // so a stale sort from the previous report never carries over.
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
