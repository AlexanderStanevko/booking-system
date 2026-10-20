import type { Room } from '../../rooms/types/room';
import type { User } from '../../users/types/user';
import type { ReservationFormValues } from './reservationForm';

export const currentTime = Date.parse('2026-01-15T08:00:00Z');
export const room: Room = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Amber',
  capacity: 4,
  floor: 1,
  location: 'East Wing',
  equipment: 'Whiteboard',
  isActive: true,
};
export const user: User = {
  id: '20000000-0000-0000-0000-000000000001',
  firstName: 'Alex',
  lastName: 'Morgan',
  activeReservationCount: 0,
};
export const validationContext = {
  rooms: [room],
  users: [user],
  configuration: { maxDurationDays: 7, maxAdvanceBookingDays: 90 },
  now: () => currentTime,
};
export const validValues: ReservationFormValues = {
  title: 'Planning',
  roomId: room.id,
  organizerId: user.id,
  startTime: '2026-01-15T11:00',
  endTime: '2026-01-15T12:00',
  attendeeCount: '4',
};
