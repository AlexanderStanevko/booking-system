import { useState, type ChangeEvent } from 'react';

const defaultPageSize = 10;
export const paginationPageSizes = [defaultPageSize, 25, 50];

export function usePagination<T>(records: readonly T[], resetKey = '') {
  const [state, setState] = useState({ page: 0, rowsPerPage: defaultPageSize, resetKey });
  const lastPage = Math.max(0, Math.ceil(records.length / state.rowsPerPage) - 1);
  const page = resetKey === state.resetKey ? Math.min(state.page, lastPage) : 0;
  if (page !== state.page || resetKey !== state.resetKey) {
    setState({ ...state, page, resetKey });
  }
  const start = page * state.rowsPerPage;
  return {
    items: records.slice(start, start + state.rowsPerPage),
    controls: {
      count: records.length,
      page,
      rowsPerPage: state.rowsPerPage,
      onPageChange: (_event: unknown, nextPage: number) => {
        setState({ ...state, page: nextPage });
      },
      onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setState({ ...state, page: 0, rowsPerPage: Number(event.target.value) });
      },
    },
  };
}
