import { useState } from 'react';
import { DateRangeFields } from '@/components/common/DateRangeFields';
import { FilterPanel } from '@/components/common/FilterPanel';
import { dateRangeError, dateRangeParameters } from '@/utils/dates';
import type { RoomUsageFilters } from '../types/roomUsage';

const emptyRange = { from: '', to: '' };

export function UsageFilters({ onApply }: { onApply: (filters: RoomUsageFilters) => void }) {
  const [range, setRange] = useState(emptyRange);
  const [error, setError] = useState<string | null>(null);
  function apply() {
    const error = dateRangeError(range);
    setError(error);
    if (!error) onApply(dateRangeParameters(range));
  }
  function reset() {
    setRange(emptyRange);
    setError(null);
    onApply({});
  }
  return (
    <FilterPanel onApply={apply} onReset={reset} error={error}>
      <DateRangeFields value={range} onChange={setRange} />
    </FilterPanel>
  );
}
