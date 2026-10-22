import { useState } from 'react';
import { DateRangeFields } from '@/components/common/DateRangeFields';
import { FilterPanel } from '@/components/common/FilterPanel';
import { SelectFilter } from '@/components/common/SelectFilter';
import { dateRangeError, dateRangeParameters } from '@/utils/dates';
import type { Room } from '@/features/rooms/types/room';
import type { User } from '@/features/users/types/user';
import { reservationStatusSchema, type ReservationFilters as Filters } from '../types/reservation';

const emptyFilters = { roomId: '', organizerId: '', status: '', from: '', to: '' };

interface Props {
  rooms: Room[];
  users: User[];
  onApply: (filters: Filters) => void;
}

export function ReservationFilters({ rooms, users, onApply }: Props) {
  const [values, setValues] = useState(emptyFilters);
  const [error, setError] = useState<string | null>(null);
  function apply() {
    const error = dateRangeError(values);
    setError(error);
    if (error) return;
    const status = reservationStatusSchema.safeParse(values.status);
    onApply({
      roomId: values.roomId || undefined,
      organizerId: values.organizerId || undefined,
      status: status.success ? status.data : undefined,
      ...dateRangeParameters(values),
    });
  }
  function reset() {
    setValues(emptyFilters);
    setError(null);
    onApply({});
  }
  return (
    <FilterPanel onApply={apply} onReset={reset} error={error}>
      <SelectFilter
        searchable
        label="Room"
        value={values.roomId}
        onChange={(roomId) => setValues({ ...values, roomId })}
        emptyLabel="All rooms"
        options={rooms.map((room) => ({ value: room.id, label: room.name }))}
      />
      <SelectFilter
        searchable
        label="Organizer"
        value={values.organizerId}
        onChange={(organizerId) => setValues({ ...values, organizerId })}
        emptyLabel="All organizers"
        options={users.map((user) => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName}`,
        }))}
      />
      <SelectFilter
        label="Status"
        value={values.status}
        onChange={(status) => setValues({ ...values, status })}
        emptyLabel="All statuses"
        options={reservationStatusSchema.options.map((status) => ({
          value: status,
          label: status,
        }))}
      />
      <DateRangeFields value={values} onChange={(range) => setValues({ ...values, ...range })} />
    </FilterPanel>
  );
}
