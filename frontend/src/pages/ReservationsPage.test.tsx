import { act, type ChangeEvent, type ComponentProps, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { queryPolicy } from '@/api/queryClient';
import { ApiError } from '@/api/errors';
import type { TablePanel } from '@/components/common/TablePanel';
import {
  getReservations,
  getReservation,
  saveReservation,
  changeReservationStatus,
} from '@/features/reservations/api/reservations';
import type { ReservationFormFields } from '@/features/reservations/components/ReservationFormFields';
import type { Reservation } from '@/features/reservations/types/reservation';
import {
  room,
  user,
  validValues,
} from '@/features/reservations/validation/reservationForm.fixtures';
import { renderHook } from '@/test/renderHook';
import { theme } from '@/theme/theme';
import { toLocalDateTime } from '@/utils/dates';
import ReservationsPage from './ReservationsPage';

vi.mock('@/features/reservations/api/reservations', () => ({
  getReservations: vi.fn(),
  getReservation: vi.fn(),
  saveReservation: vi.fn(),
  changeReservationStatus: vi.fn(),
}));
vi.mock('@/features/rooms/api/rooms', () => ({ getRooms: async () => [room, otherRoom] }));
vi.mock('@/features/users/api/users', () => ({ getUsers: async () => [user] }));
vi.mock('@/api/client', () => ({
  apiRequest: async () => ({ maxDurationDays: 7, maxAdvanceBookingDays: 90 }),
}));
vi.mock('@/components/common/DateTimeInput', () => ({ DateTimeInput: () => null }));
vi.mock('@/components/common/TablePanel', () => ({
  TablePanel: ({ pagination, children }: ComponentProps<typeof TablePanel>) => (
    <>
      {children}
      <output aria-label="Current page">{pagination.page + 1}</output>
      <label>
        Rows per page
        <select
          value={pagination.rowsPerPage}
          onChange={(event) =>
            pagination.onRowsPerPageChange?.({
              target: { value: event.target.value },
            } as ChangeEvent<HTMLInputElement>)
          }
        >
          {[10, 25, 50].map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
      </label>
      <button onClick={() => pagination.onPageChange(null, pagination.page + 1)}>Next page</button>
      <button onClick={() => pagination.onPageChange(null, pagination.page - 1)}>
        Previous page
      </button>
    </>
  ),
}));
vi.mock('@/features/reservations/components/ReservationFormFields', () => ({
  ReservationFormFields: ({ form }: ComponentProps<typeof ReservationFormFields>) => (
    <button
      type="button"
      onClick={() => {
        const values = {
          ...validValues,
          title: created.title,
          roomId: created.roomId,
          startTime: toLocalDateTime(created.startTime),
          endTime: toLocalDateTime(created.endTime),
        };
        for (const [key, value] of Object.entries(values)) {
          form.setValue(key as keyof typeof values, value);
        }
      }}
    >
      Fill reservation
    </button>
  ),
}));

const otherRoom = { ...room, id: '10000000-0000-0000-0000-000000000002', name: 'Birch' };
let client: QueryClient;
let records: Reservation[];
let created: Reservation;

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <ReservationsPage />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function click(label: string, scope: ParentNode = document) {
  const button = [...scope.querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === label,
  );
  if (!button) throw new Error(`Missing button: ${label}`);
  await act(async () => button.click());
  await flush();
}

async function openCreate() {
  await click('New reservation');
  await act(async () => {
    await vi.dynamicImportSettled();
  });
  await flush();
  await click('Fill reservation');
}

async function createReservation() {
  await openCreate();
  await click('Save reservation');
}

async function select(element: HTMLSelectElement, value: string) {
  await act(async () => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await flush();
}

async function applyRoomFilter() {
  const input = document.querySelector<HTMLInputElement>('input[role="combobox"]');
  const open = input
    ?.closest('.MuiAutocomplete-root')
    ?.querySelector<HTMLButtonElement>('button[title="Open"]');
  if (!open) throw new Error('Missing room filter');
  await act(async () => open.click());
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (element) => element.textContent === room.name,
  );
  if (!option) throw new Error('Missing room option');
  await act(async () => option.click());
  await click('Apply filters');
}

function page() {
  return Number(document.querySelector('output[aria-label="Current page"]')?.textContent) - 1;
}

function createdRow() {
  return [...document.querySelectorAll('tbody tr')].find((row) =>
    row.textContent?.includes(created.title),
  );
}

async function mount() {
  const view = await renderHook(() => null, Wrapper);
  await flush();
  return view;
}

beforeAll(async () => {
  await import('@/features/reservations/components/ReservationFormDialog');
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2026-01-15T08:00:00Z');
  Element.prototype.scrollIntoView = vi.fn();
  client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: queryPolicy.staleTime, gcTime: Infinity, retry: false },
    },
  });
  records = Array.from({ length: 41 }, (_, index): Reservation => ({
    id: `meeting-${index}`,
    title: `Meeting ${index}`,
    roomId: room.id,
    roomName: room.name,
    organizerId: user.id,
    organizerName: 'Alex Morgan',
    startTime: new Date(Date.UTC(2026, 0, 16, 0, index * 10)).toISOString(),
    endTime: new Date(Date.UTC(2026, 0, 16, 0, index * 10 + 5)).toISOString(),
    attendeeCount: 4,
    status: 'Booked',
    actualEndTime: null,
  })).reverse();
  created = {
    ...records[0]!,
    id: 'new-reservation',
    title: 'Created reservation',
    startTime: '2026-01-16T05:45:00Z',
    endTime: '2026-01-16T05:49:00Z',
  };
  vi.mocked(getReservations).mockImplementation(async (filters) =>
    records.filter(
      (record) =>
        (!filters.roomId || record.roomId === filters.roomId) &&
        (!filters.status || record.status === filters.status),
    ),
  );
  vi.mocked(getReservation).mockImplementation(async (id) =>
    records.find((record) => record.id === id)!,
  );
  vi.mocked(saveReservation).mockImplementation(async ({ id }) => {
    if (id) {
      const updated = { ...records.find((record) => record.id === id)!, title: created.title };
      records = records.map((record) => (record.id === id ? updated : record));
      return updated;
    }
    records = [...records, created];
    return created;
  });
  vi.mocked(changeReservationStatus).mockImplementation(async ({ id, action }) => {
    const updated: Reservation = {
      ...records.find((record) => record.id === id)!,
      status: action === 'cancel' ? 'Cancelled' : 'Completed',
    };
    records = records.map((record) => (record.id === id ? updated : record));
    return updated;
  });
});

afterEach(() => {
  client.clear();
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.useRealTimers();
});

it('reveals a successful creation using the selected page size', async () => {
  const size = 25;
  await mount();
  const sizeSelect = document
    .querySelector('output[aria-label="Current page"]')
    ?.nextElementSibling?.querySelector('select');
  if (!sizeSelect) throw new Error('Missing page size');
  await select(sizeSelect, String(size));
  await createReservation();
  expect(page()).toBe(Math.floor(35 / size));
  const row = createdRow();
  expect(row).toBeDefined();
  expect(getComputedStyle(row!).backgroundColor).toBe(theme.palette.action.selected);
  expect(row?.scrollIntoView).toHaveBeenCalled();
  expect(document.body.textContent).toContain('Reservation created.');
  expect(saveReservation).toHaveBeenCalledTimes(1);
  expect(getReservations).toHaveBeenCalledTimes(2);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('waits for the existing mutation refetch before revealing the created row', async () => {
  await mount();
  let finishRefetch!: (data: Reservation[]) => void;
  vi.mocked(getReservations).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishRefetch = resolve;
      }),
  );
  await openCreate();
  await click('Save reservation');
  expect(page()).toBe(0);
  expect(createdRow()).toBeUndefined();
  expect(document.body.textContent).toContain('Saving');
  await act(async () => finishRefetch([...records]));
  await flush();
  expect(page()).toBe(3);
  expect(createdRow()).toBeDefined();
  expect(getReservations).toHaveBeenCalledTimes(2);
});

it('navigates to a page that only exists after the creation refetch', async () => {
  records = records.filter((record) => Number(record.id.split('-')[1]) < 10);
  created = {
    ...created,
    startTime: '2026-01-16T02:00:00Z',
    endTime: '2026-01-16T02:05:00Z',
  };
  await mount();
  await createReservation();
  expect(page()).toBe(1);
  expect(createdRow()).toBeDefined();
});

it('uses the active filtered list to find a matching creation', async () => {
  await mount();
  records = records.filter((record) => Number(record.id.split('-')[1]) >= 30);
  await applyRoomFilter();
  await createReservation();
  expect(page()).toBe(0);
  expect(createdRow()).toBeDefined();
  expect(document.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe(room.name);
  expect(getReservations).toHaveBeenLastCalledWith(
    expect.objectContaining({ roomId: room.id }),
    expect.any(AbortSignal),
  );
});

it('keeps filters and pagination when a creation is excluded and explains why', async () => {
  await mount();
  await applyRoomFilter();
  await click('Next page');
  await click('Next page');
  created = { ...created, roomId: otherRoom.id, roomName: otherRoom.name };
  await createReservation();
  expect(page()).toBe(2);
  expect(document.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe(room.name);
  expect(createdRow()).toBeUndefined();
  expect(document.body.textContent).toContain(
    'Reservation created, but it is hidden by the current filters.',
  );
  expect(getReservations).toHaveBeenCalledTimes(3);
});

it('expires the highlight without refetching or overriding manual pagination', async () => {
  await mount();
  await createReservation();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2999);
  });
  expect(getComputedStyle(createdRow()!).backgroundColor).toBe(theme.palette.action.selected);
  await click('Next page');
  expect(page()).toBe(4);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(page()).toBe(4);
  await click('Previous page');
  expect(getComputedStyle(createdRow()!).backgroundColor).not.toBe(theme.palette.action.selected);
  expect(page()).toBe(3);
  expect(getReservations).toHaveBeenCalledTimes(2);
});

it('cleans up its single highlight timeout when the page unmounts', async () => {
  const view = await mount();
  const scheduled = vi.spyOn(window, 'setTimeout');
  const cleared = vi.spyOn(window, 'clearTimeout');
  await createReservation();
  const timers = scheduled.mock.calls.flatMap((call, index) =>
    call[1] === 3000 ? [scheduled.mock.results[index]!.value] : [],
  );
  expect(timers).toHaveLength(1);
  await view.unmount();
  expect(cleared).toHaveBeenCalledWith(timers[0]);
});

it('replaces the previous highlight timeout after another creation', async () => {
  await mount();
  await createReservation();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  created = { ...created, id: 'second-creation', title: 'Second creation' };
  await createReservation();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(getComputedStyle(createdRow()!).backgroundColor).toBe(theme.palette.action.selected);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(getComputedStyle(createdRow()!).backgroundColor).not.toBe(theme.palette.action.selected);
});

it.each(['edit', 'cancel', 'complete', 'refresh'] as const)(
  'preserves the current valid page after %s',
  async (operation) => {
    if (operation === 'complete') {
      records = records.map((record) => ({
        ...record,
        startTime: record.startTime.replace('16T', '14T'),
      }));
    }
    await mount();
    await click('Next page');
    await click('Next page');
    if (operation === 'refresh') {
      await click('Refresh');
    } else {
      const row = document.querySelector('tbody tr');
      if (!row) throw new Error('Missing reservation row');
      await click(
        operation === 'complete' ? 'End meeting' : operation === 'cancel' ? 'Cancel' : 'Edit',
        row,
      );
      if (operation === 'edit') {
        await click('Fill reservation');
        await click('Save reservation');
      } else {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) throw new Error('Missing confirmation');
        await click(operation === 'cancel' ? 'Cancel reservation' : 'End meeting', dialog);
      }
    }
    expect(page()).toBe(2);
    expect(
      [...document.querySelectorAll('tbody tr')].some(
        (row) => getComputedStyle(row).backgroundColor === theme.palette.action.selected,
      ),
    ).toBe(false);
    expect(getReservations).toHaveBeenCalledTimes(2);
  },
);

it('does not misreport a list refresh failure as exclusion by filters', async () => {
  await mount();
  vi.mocked(getReservations).mockRejectedValueOnce(new Error('Refresh failed'));
  await createReservation();
  expect(document.body.textContent).toContain(
    'Reservation created, but the list could not be refreshed. Refresh to find it.',
  );
  expect(document.body.textContent).not.toContain('hidden by the current filters');
  expect(getReservations).toHaveBeenCalledTimes(2);
});

it('keeps a failed creation open, shows the API error and allows retry', async () => {
  await mount();
  vi.mocked(saveReservation).mockRejectedValueOnce(
    new ApiError('ROOM_ALREADY_BOOKED', 'This room is already booked.', 409),
  );
  await createReservation();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(document.body.textContent).toContain('This room is already booked.');
  expect(createdRow()).toBeUndefined();
  expect(getReservations).toHaveBeenCalledTimes(1);
  await click('Save reservation');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(createdRow()).toBeDefined();
  expect(saveReservation).toHaveBeenCalledTimes(2);
});
