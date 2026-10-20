import { useState } from 'react';
import { Alert, Typography } from '@mui/material';
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
        description="Understand how scheduled time compares with recorded and estimated usage."
        onRefresh={() => void reports.refetch()}
        refreshing={reports.isFetching}
      />
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Read these numbers with context
        </Typography>
        <Typography variant="body2">
          Recorded usage comes from meetings explicitly ended early. Estimated usage uses the
          scheduled duration of automatically completed meetings. Neither measures independently
          verified physical occupancy.
        </Typography>
      </Alert>
      <UsageFilters onApply={setFilters} />
      <QueryState
        pending={reports.isPending}
        error={reports.error}
        empty={reports.data?.length === 0}
        emptyMessage="There are no rooms to report on yet."
        onRetry={() => void reports.refetch()}
      >
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
