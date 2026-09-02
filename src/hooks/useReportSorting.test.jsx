import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useReportSorting } from './useReportSorting.js';
import { reportSortKeys } from '../utils/reportSorting.js';

// TEAM EXTENSION test (X-006): protects the hook's own state machine
// (which column is active, which direction, reset behavior) independently
// of any specific report page that consumes it.
function createCost(id, overrides) {
  return {
    id,
    description: id,
    category: 'General',
    sum: 1,
    currency: 'USD',
    date: {
      day: 1,
      month: 1,
      year: 2026,
      hour: 12,
      minute: 0
    },
    ...overrides
  };
}

function sortedIds(result) {
  return result.current.sortedCosts.map((cost) => cost.id);
}

describe('useReportSorting', () => {
  it('starts unsorted with source ordering', () => {
    const costs = [
      createCost('sum-100', { sum: 100 }),
      createCost('sum-2', { sum: 2 })
    ];

    const { result } = renderHook(() => useReportSorting(costs));

    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDirection).toBe('asc');
    expect(sortedIds(result)).toEqual(['sum-100', 'sum-2']);
  });

  it('sets first column click to ascending', () => {
    const costs = [
      createCost('sum-100', { sum: 100 }),
      createCost('sum-2', { sum: 2 })
    ];

    const { result } = renderHook(() => useReportSorting(costs));

    act(() => result.current.requestSort(reportSortKeys.sum));

    expect(result.current.sortKey).toBe(reportSortKeys.sum);
    expect(result.current.sortDirection).toBe('asc');
    expect(sortedIds(result)).toEqual(['sum-2', 'sum-100']);
  });

  it('toggles the same column descending then ascending', () => {
    const costs = [
      createCost('sum-100', { sum: 100 }),
      createCost('sum-2', { sum: 2 })
    ];

    const { result } = renderHook(() => useReportSorting(costs));

    act(() => result.current.requestSort(reportSortKeys.sum));
    act(() => result.current.requestSort(reportSortKeys.sum));

    expect(result.current.sortDirection).toBe('desc');
    expect(sortedIds(result)).toEqual(['sum-100', 'sum-2']);

    act(() => result.current.requestSort(reportSortKeys.sum));

    expect(result.current.sortDirection).toBe('asc');
    expect(sortedIds(result)).toEqual(['sum-2', 'sum-100']);
  });

  it('starts a different column at ascending', () => {
    const costs = [
      createCost('banana', { description: 'banana', sum: 100 }),
      createCost('Apple', { description: 'Apple', sum: 2 })
    ];

    const { result } = renderHook(() => useReportSorting(costs));

    act(() => result.current.requestSort(reportSortKeys.sum));
    act(() => result.current.requestSort(reportSortKeys.sum));
    act(() => result.current.requestSort(reportSortKeys.description));

    expect(result.current.sortKey).toBe(reportSortKeys.description);
    expect(result.current.sortDirection).toBe('asc');
    expect(sortedIds(result)).toEqual(['Apple', 'banana']);
  });

  it('resets sorting to original ordering', () => {
    const costs = [
      createCost('sum-100', { sum: 100 }),
      createCost('sum-2', { sum: 2 })
    ];

    const { result } = renderHook(() => useReportSorting(costs));

    act(() => result.current.requestSort(reportSortKeys.sum));
    act(() => result.current.resetSort());

    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDirection).toBe('asc');
    expect(sortedIds(result)).toEqual(['sum-100', 'sum-2']);
  });

  it('does not mutate input data', () => {
    const costs = [
      createCost('sum-100', { sum: 100 }),
      createCost('sum-2', { sum: 2 })
    ];
    const originalSnapshot = structuredClone(costs);

    const { result } = renderHook(() => useReportSorting(costs));

    act(() => result.current.requestSort(reportSortKeys.sum));

    expect(costs).toEqual(originalSnapshot);
  });
});
