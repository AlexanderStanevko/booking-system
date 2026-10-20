import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClock } from '@/hooks/useClock';
import { isValidLocalDateTime, millisecondsPerMinute, reservationTimestamp } from '@/utils/dates';
import type { Room } from '@/features/rooms/types/room';
import type { User } from '@/features/users/types/user';
import type { Reservation } from '../types/reservation';
import {
  createReservationFormSchema,
  reservationFormDefaults,
  type ReservationFormValues,
  type ReservationFormResult,
} from '../validation/reservationForm';
import type { BookingConfiguration } from './useBookingConfiguration';

interface Props {
  rooms: Room[];
  users: User[];
  configuration: BookingConfiguration;
  reservation?: Reservation;
}

export function useReservationForm(context: Props) {
  const form = useForm<ReservationFormValues, undefined, ReservationFormResult>({
    resolver: zodResolver(createReservationFormSchema(context)),
    defaultValues: reservationFormDefaults(context.reservation),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });
  const start = useWatch({ control: form.control, name: 'startTime' });
  const [pickerOpen, setPickerOpen] = useState(false);
  const startTimestamp = isValidLocalDateTime(start)
    ? Date.parse(reservationTimestamp(start, context.reservation?.startTime))
    : undefined;
  const clock = useClock([startTimestamp ?? NaN], pickerOpen ? millisecondsPerMinute : undefined);
  const { now } = clock;
  const { trigger } = form;
  useEffect(() => {
    if (startTimestamp !== undefined && now >= startTimestamp) void trigger('startTime');
  }, [startTimestamp, now, trigger]);
  function onPickerOpenChange(open: boolean) {
    setPickerOpen(open);
    if (open) clock.refresh();
  }
  return { ...form, now, startTimestamp, onPickerOpenChange };
}

export type ReservationForm = ReturnType<typeof useReservationForm>;
