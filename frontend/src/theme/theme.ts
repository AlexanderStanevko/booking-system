import { alpha, createTheme } from '@mui/material/styles';

export const layoutTokens = {
  sidebarWidth: 248,
  contentWidth: 1600,
  filterWidth: 176,
};

const colors = {
  primary: '#287A74',
  secondary: '#55A9A0',
  mint: '#AEEED3',
  accent: '#FFF8B0',
  background: '#F8FAF9',
  surface: '#FFFFFF',
  text: '#243331',
  muted: '#61716C',
  border: '#E3EAE7',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.primary, contrastText: colors.surface },
    secondary: { main: colors.secondary, contrastText: colors.text },
    background: { default: colors.background, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.muted },
    divider: colors.border,
    success: { main: '#28734D', light: '#E8F4EC' },
    warning: { main: '#806013', light: colors.accent },
    info: { main: '#245C87', light: '#EAF2FA' },
    error: { main: '#A13842', light: '#FBECEF' },
    action: { selected: alpha(colors.mint, 0.4), hover: alpha(colors.primary, 0.045) },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h4: { fontSize: '1.85rem', fontWeight: 650, letterSpacing: '-0.04em' },
    h5: { fontSize: '1.3rem', fontWeight: 650, letterSpacing: '-0.02em' },
    h6: { fontSize: '1rem', fontWeight: 650 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (muiTheme) => ({
        ':root': {
          '--sidebar-width': `${layoutTokens.sidebarWidth}px`,
          '--content-width': `${layoutTokens.contentWidth}px`,
          '--desktop-gutter': muiTheme.spacing(4),
          '--mobile-gutter': muiTheme.spacing(2.5),
        },
        body: { fontVariantNumeric: 'tabular-nums' },
        a: { color: 'inherit' },
        '*': { boxSizing: 'border-box' },
        ':focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 3 },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 38, paddingInline: 16 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderColor: colors.border } },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small', fullWidth: true } },
    MuiAutocomplete: {
      defaultProps: { size: 'small', fullWidth: true },
      styleOverrides: {
        paper: { border: `1px solid ${colors.border}` },
        option: ({ theme }) => ({
          ...theme.typography.body2,
          padding: '8px 12px',
          minHeight: 48,
          [theme.breakpoints.up('sm')]: { minHeight: 40 },
        }),
      },
    },
    MuiMenu: {
      defaultProps: { slotProps: { paper: { elevation: 1 } } },
      styleOverrides: { paper: { border: `1px solid ${colors.border}` } },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.body2,
          padding: '8px 12px',
          minHeight: 48,
          [theme.breakpoints.up('sm')]: { minHeight: 40 },
        }),
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: colors.surface } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.border, padding: '16px 20px' },
        head: {
          color: colors.muted,
          backgroundColor: colors.background,
          fontSize: '0.72rem',
          fontWeight: 650,
          whiteSpace: 'nowrap',
        },
        body: { fontSize: '0.82rem' },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { fontWeight: 600, fontSize: '0.72rem', borderRadius: 6 } },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: '1.25rem', fontWeight: 650, padding: '24px 24px 16px' } },
    },
    MuiAlert: { styleOverrides: { root: { alignItems: 'center' } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': { color: colors.primary, backgroundColor: alpha(colors.mint, 0.4) },
        },
      },
    },
  },
});
