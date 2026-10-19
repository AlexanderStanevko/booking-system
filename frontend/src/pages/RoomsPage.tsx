import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { QueryState } from '../components/common/QueryState';
import { TablePanel } from '../components/common/TablePanel';
import { RoomFilters } from '../features/rooms/components/RoomFilters';
import { RoomTable } from '../features/rooms/components/RoomTable';
import { useRooms } from '../features/rooms/hooks/useRooms';
import type { RoomFilters as Filters } from '../features/rooms/types/room';

export default function RoomsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const rooms = useRooms(filters);
  return (
    <>
      <PageHeader title="Rooms" description="Find the right space for your next meeting." />
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
        >
          <RoomTable rooms={rooms.data ?? []} />
        </TablePanel>
      </QueryState>
    </>
  );
}
