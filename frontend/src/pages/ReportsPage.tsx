import { useState } from 'react';
import { Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { TablePanel } from '@/components/common/TablePanel';
import { RoomUsageTable } from '@/features/reports/components/RoomUsageTable';
import { UsageFilters } from '@/features/reports/components/UsageFilters';
import { useRoomUsage } from '@/features/reports/hooks/useRoomUsage';
import type { RoomUsageFilters } from '@/features/reports/types/roomUsage';
import { usePagination } from '@/hooks/usePagination';

export default function ReportsPage() {
  const [filters, setFilters] = useState<RoomUsageFilters>({});
  const reports = useRoomUsage(filters);
  const pagination = usePagination(reports.data ?? [], JSON.stringify(filters));
  return (
    <>
      <PageHeader
        title="Room usage"
        onRefresh={() => void reports.refetch()}
        refreshing={reports.isFetching}
      />
      <UsageFilters onApply={setFilters} />
      <QueryState
        pending={reports.isPending}
        error={reports.error}
        empty={reports.data?.length === 0}
        emptyMessage="There are no rooms to report on yet."
        onRetry={() => void reports.refetch()}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Recorded and estimated usage do not independently verify physical room occupancy.
        </Typography>
        <TablePanel
          title="Usage by room"
          count={reports.data?.length ?? 0}
          refreshing={reports.isFetching}
          pagination={pagination.controls}
        >
          <RoomUsageTable reports={pagination.items} />
        </TablePanel>
      </QueryState>
    </>
  );
}
