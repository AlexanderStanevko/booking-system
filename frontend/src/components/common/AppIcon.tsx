import { SvgIcon, type SvgIconProps } from '@mui/material';

const paths = {
  rooms: 'M3 21h18M5 21V3h14v18M9 7h2M9 11h2M9 15h2M15 7h1M15 11h1M15 15h1',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  reservations:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M8 14h2M14 14h2M8 18h2',
  reports: 'M4 3v18h17M9 17v-5M14 17V8M19 17V4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  filter: 'M4 7h16M7 12h10M10 17h4',
  edit: 'm16 3 5 5M3 21l5-1L21 7a2 2 0 0 0-4-4L4 16l-1 5',
  clock: 'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
} satisfies Record<string, string>;

export type IconName = keyof typeof paths;

export function AppIcon({ name, ...props }: SvgIconProps & { name: IconName }) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </SvgIcon>
  );
}
