import { SvgIcon, type SvgIconProps } from '@mui/material';
import {
  Building2,
  CalendarDays,
  ChartColumnIncreasing,
  Clock,
  ListFilter,
  Menu,
  Pencil,
  Plus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

const icons = {
  rooms: Building2,
  users: Users,
  reservations: CalendarDays,
  reports: ChartColumnIncreasing,
  menu: Menu,
  close: X,
  plus: Plus,
  filter: ListFilter,
  edit: Pencil,
  clock: Clock,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function AppIcon({ name, sx, ...props }: SvgIconProps & { name: IconName }) {
  return (
    <SvgIcon
      {...props}
      component={icons[name]}
      inheritViewBox
      strokeWidth={1.75}
      sx={[{ fill: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
