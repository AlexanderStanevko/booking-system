import { act, useEffect, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '@/test/renderHook';
import { theme } from '@/theme/theme';
import { useReservationForm, type ReservationForm } from '../hooks/useReservationForm';
import type { Reservation } from '../types/reservation';
import {
  currentTime,
  room,
  user,
  validValues,
  validationContext,
} from '../validation/reservationForm.fixtures';
import { ReservationFormFields } from './ReservationFormFields';

vi.mock('@/components/common/DateTimeInput', () => ({ DateTimeInput: () => null }));

const otherUser = { ...user, id: '20000000-0000-0000-0000-000000000002', firstName: 'Maya' };
const rooms = [room, { ...room, id: 'inactive', name: 'Iris', isActive: false }];
const users = [user, otherUser];
let form: ReservationForm;
let reservation: Reservation | undefined;

function Wrapper({ children }: { children: ReactNode }) {
  const currentForm = useReservationForm({ ...validationContext, rooms, users, reservation });
  useEffect(() => {
    form = currentForm;
  }, [currentForm]);
  return (
    <ThemeProvider theme={theme}>
      <ReservationFormFields
        form={currentForm}
        rooms={rooms}
        users={users}
        reservation={reservation}
        configuration={validationContext.configuration}
      />
      {children}
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(currentTime);
  reservation = undefined;
});

afterEach(() => {
  vi.useRealTimers();
});

function organizerInput() {
  return document.querySelector<HTMLInputElement>('#reservation-organizer')!;
}

async function chooseOrganizer(name: string) {
  const input = organizerInput();
  await act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, name);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (item) => item.textContent === name,
  )!;
  await act(async () => option.click());
}

it('keeps organizer validation on blur and stores the selected user ID', async () => {
  await renderHook(() => null, Wrapper);
  expect(form.getFieldState('organizerId').error).toBeUndefined();
  await act(async () => {
    organizerInput().focus();
    organizerInput().blur();
  });
  expect(form.getFieldState('organizerId').error?.message).toBe('Choose an organizer.');
  expect(organizerInput().getAttribute('aria-invalid')).toBe('true');
  await chooseOrganizer('Maya Morgan');
  await act(async () => organizerInput().blur());
  expect(form.getValues('organizerId')).toBe(otherUser.id);
  expect(form.getFieldState('organizerId').error).toBeUndefined();
  expect(organizerInput().value).toBe('Maya Morgan');
});

it('preserves existing edit selections and keeps inactive rooms disabled', async () => {
  reservation = {
    ...validValues,
    id: 'existing',
    roomName: room.name,
    organizerName: 'Alex Morgan',
    startTime: '2026-01-15T09:00:12.1234567Z',
    endTime: '2026-01-15T10:00:12.1234567Z',
    attendeeCount: 4,
    status: 'Booked',
    actualEndTime: null,
  };
  await renderHook(() => null, Wrapper);
  expect(organizerInput().value).toBe('Alex Morgan');
  expect(form.getValues('organizerId')).toBe(user.id);
  await chooseOrganizer('Maya Morgan');
  expect(form.getValues('organizerId')).toBe(otherUser.id);
  expect(form.getValues('roomId')).toBe(room.id);
  const roomInput = document.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const open = roomInput
    .closest('.MuiAutocomplete-root')!
    .querySelector<HTMLButtonElement>('button[title="Open"]')!;
  await act(async () => open.click());
  const inactive = [...document.querySelectorAll('[role="option"]')].find((item) =>
    item.textContent?.includes('Iris'),
  );
  expect(inactive?.getAttribute('aria-disabled')).toBe('true');
});
