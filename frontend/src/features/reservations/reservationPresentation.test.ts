import { getContrastRatio } from '@mui/material/styles';
import { expect, it } from 'vitest';
import { theme } from '../../theme/theme';
import { statusColors } from './reservationPresentation';
import { reservationStatusSchema } from './types/reservation';

it('provides distinct semantic colors for every named status', () => {
  expect(Object.keys(statusColors)).toEqual(reservationStatusSchema.options);
  expect(new Set(Object.values(statusColors)).size).toBe(reservationStatusSchema.options.length);
  expect(statusColors).toEqual({ Booked: 'info', Completed: 'success', Cancelled: 'error' });
});

it.each(Object.values(statusColors))('keeps %s status text at AA contrast', (color) => {
  expect(
    getContrastRatio(theme.palette[color].main, theme.palette.background.paper),
  ).toBeGreaterThanOrEqual(4.5);
});
