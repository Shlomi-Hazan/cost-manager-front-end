import { useMemo, useState } from "react";
import {
  REPORT_SORT_DIRECTIONS,
  sortReportCosts
} from "../utils/reportSorting.js";

export function useReportSorting(costs) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(REPORT_SORT_DIRECTIONS.asc);

  const sortedCosts = useMemo(() => {
    return sortReportCosts(costs, { sortKey, sortDirection });
  }, [costs, sortDirection, sortKey]);

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
