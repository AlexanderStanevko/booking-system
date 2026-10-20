import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Snackbar, Typography } from '@mui/material';
import { AppIcon } from '@/components/common/AppIcon';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { TablePanel } from '@/components/common/TablePanel';
import { ReservationDialogs } from '@/features/reservations/components/ReservationDialogs';
import { ReservationFilters } from '@/features/reservations/components/ReservationFilters';
import { ReservationTable } from '@/features/reservations/components/ReservationTable';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import type {
  ReservationDialog,
  ReservationFilters as Filters,
} from '@/features/reservations/types/reservation';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useUsers } from '@/features/users/hooks/useUsers';
import { invalidateReservationData } from '@/features/reservations/api/reservationCache';
import { orderReservations } from '@/features/reservations/reservationPresentation';
import { usePagination } from '@/hooks/usePagination';

const notificationDuration = 6000;

export default function ReservationsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [dialog, setDialog] = useState<ReservationDialog | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const reservations = useReservations(filters);
  const allReservations = reservations.data ?? [];
  const pagination = usePagination(orderReservations(allReservations), JSON.stringify(filters));
  const rooms = useRooms();
  const users = useUsers();
  const client = useQueryClient();
  const pending = reservations.isPending || rooms.isPending || users.isPending;
  const error = reservations.error ?? rooms.error ?? users.error;
  function saved(message: string) {
    setDialog(null);
    setNotice(message);
  }
  return (
    <>
      <PageHeader
        title="Reservations"
        description="Book a space, coordinate meetings, and keep your day moving."
        onRefresh={() => void invalidateReservationData(client)}
        refreshing={reservations.isFetching || users.isFetching}
        action={
          <Button
            variant="contained"
            startIcon={<AppIcon name="plus" />}
            onClick={() => setDialog({ kind: 'create' })}
            disabled={pending || !!rooms.error || !!users.error}
          >
            New reservation
          </Button>
        }
      />
      <ReservationFilters rooms={rooms.data ?? []} users={users.data ?? []} onApply={setFilters} />
      <QueryState
        pending={pending}
        error={error}
        empty={reservations.data?.length === 0}
        emptyMessage="No meetings match these filters. Adjust the filters or create a reservation."
        onRetry={() => {
          for (const query of [reservations, rooms, users]) {
            if (query.error) void query.refetch();
          }
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Upcoming and ongoing meetings appear first.
        </Typography>
        <TablePanel
          title="Meeting schedule"
          count={reservations.data?.length ?? 0}
          refreshing={reservations.isFetching}
          pagination={pagination.controls}
        >
          <ReservationTable
            reservations={allReservations}
            visibleReservations={pagination.items}
            onAction={(kind, reservation) => setDialog({ kind, reservationId: reservation.id })}
          />
        </TablePanel>
      </QueryState>
      <ReservationDialogs
        dialog={dialog}
        rooms={rooms.data ?? []}
        users={users.data ?? []}
        onClose={() => setDialog(null)}
        onSaved={saved}
      />
      <Snackbar
        open={!!notice}
        autoHideDuration={notificationDuration}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      </Snackbar>
    </>
  );
}
