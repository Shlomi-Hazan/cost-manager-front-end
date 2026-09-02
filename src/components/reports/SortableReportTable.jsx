import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
/*
 * TEAM EXTENSION: the shared sortable table used by both the Monthly and
 * Yearly report pages. `dateMode` is the only thing that differs between
 * them — "monthly" shows just the day (matching the required report-item
 * date shape), "yearly" shows the full date since rows can span 12 months.
 * All sorting logic itself lives in reportSorting.js / useReportSorting.js;
 * this component only renders columns and forwards header clicks.
 */
import { formatDateForDisplay, formatTime } from '../../utils/dateTime.js';
import { REPORT_SORT_KEYS } from '../../utils/reportSorting.js';

const DATE_MODES = {
  monthly: 'monthly',
  yearly: 'yearly'
};

function formatAmount(amount) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString('en-US', {
        maximumFractionDigits: 6
      });
}

function getDateLabel(dateMode) {
  return dateMode === DATE_MODES.yearly ? 'Date' : 'Day';
}

function getTableLabel(dateMode) {
  return dateMode === DATE_MODES.yearly
    ? 'Yearly report costs'
    : 'Monthly report costs';
}

function formatDateCell(cost, dateMode) {
  return dateMode === DATE_MODES.yearly
    ? formatDateForDisplay(cost.date)
    : cost.date.day;
}

function SortableHeaderCell({
  align,
  label,
  onRequestSort,
  sortDirection,
  sortKey,
  targetSortKey
}) {
  const isActive = sortKey === targetSortKey;

  return (
    <TableCell align={align} sortDirection={isActive ? sortDirection : false}>
      <TableSortLabel
        active={isActive}
        direction={isActive ? sortDirection : 'asc'}
        onClick={() => onRequestSort(targetSortKey)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function SortableReportTable({
  costs,
  dateMode,
  onRequestSort,
  sortDirection,
  sortKey
}) {
  return (
    <TableContainer>
      <Table aria-label={getTableLabel(dateMode)}>
        <TableHead>
          <TableRow>
            {/* Date/Time columns: label switches with dateMode. */}
            <SortableHeaderCell
              label={getDateLabel(dateMode)}
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.date}
            />
            <SortableHeaderCell
              label="Time"
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.time}
            />
            {/* Text columns: description then category. */}
            <SortableHeaderCell
              label="Description"
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.description}
            />
            <SortableHeaderCell
              label="Category"
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.category}
            />
            {/* Numeric columns: sum is right-aligned, currency is not. */}
            <SortableHeaderCell
              align="right"
              label="Sum"
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.sum}
            />
            {/* Last header cell: currency code for each row. */}
            <SortableHeaderCell
              label="Currency"
              onRequestSort={onRequestSort}
              sortDirection={sortDirection}
              sortKey={sortKey}
              targetSortKey={REPORT_SORT_KEYS.currency}
            />
          </TableRow>
        </TableHead>
        {/* One row per cost, in the order the caller already sorted them. */}
        <TableBody>
          {costs.map((cost) => (
            // Column order here must match the header cells above.
            <TableRow key={cost.id}>
              <TableCell>{formatDateCell(cost, dateMode)}</TableCell>
              <TableCell>{formatTime(cost.date)}</TableCell>
              <TableCell>{cost.description}</TableCell>
              <TableCell>{cost.category}</TableCell>
              <TableCell align="right">{formatAmount(cost.sum)}</TableCell>
              <TableCell>{cost.currency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SortableReportTable;
