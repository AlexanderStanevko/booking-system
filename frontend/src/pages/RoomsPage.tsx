import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { TablePanel } from '@/components/common/TablePanel';
import { RoomFilters } from '@/features/rooms/components/RoomFilters';
import { RoomTable } from '@/features/rooms/components/RoomTable';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import type { RoomFilters as Filters } from '@/features/rooms/types/room';
import { usePagination } from '@/hooks/usePagination';

export default function RoomsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const rooms = useRooms(filters);
  const pagination = usePagination(rooms.data ?? [], JSON.stringify(filters));
  return (
    <>
      <PageHeader
        title="Rooms"
        description="Find the right space for your next meeting."
        onRefresh={() => void rooms.refetch()}
        refreshing={rooms.isFetching}
      />
      <RoomFilters onApply={setFilters} />
      <QueryState
        pending={rooms.isPending}
        error={rooms.error}
        empty={rooms.data?.length === 0}
        onRetry={() => void rooms.refetch()}
      >
        <TablePanel
          title="Meeting rooms"
          count={rooms.data?.length ?? 0}
          refreshing={rooms.isFetching}
          pagination={pagination.controls}
        >
          <RoomTable rooms={pagination.items} />
        </TablePanel>
      </QueryState>
    </>
  );
}
