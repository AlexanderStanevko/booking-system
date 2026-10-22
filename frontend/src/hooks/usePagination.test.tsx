import { act, type ChangeEvent } from 'react';
import { expect, it } from 'vitest';
import { renderHook } from '@/test/renderHook';
import { usePagination } from './usePagination';

const records = Array.from({ length: 51 }, (_, index) => index + 1);
const pageSizeEvent = (size: number) =>
  ({ target: { value: String(size) } }) as ChangeEvent<HTMLInputElement>;

it('preserves ordering while paging and resets to the first page when changing page size', async () => {
  const view = await renderHook(() => usePagination(records));
  expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: 10, count: 51 });
  expect(view.current.items).toEqual(records.slice(0, 10));
  await act(async () => view.current.controls.onPageChange(null, 1));
  expect(view.current.items).toEqual(records.slice(10, 20));
  for (const size of [25, 50]) {
    await act(async () => view.current.controls.onPageChange(null, 1));
    await act(async () => view.current.controls.onRowsPerPageChange(pageSizeEvent(size)));
    expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: size });
    expect(view.current.items).toEqual(records.slice(0, size));
  }
});

it('keeps a valid page on refresh but resets changed filters while preserving page size', async () => {
  let filterKey = 'Booked';
  let data = records;
  const view = await renderHook(() => usePagination(data, filterKey));
  await act(async () => view.current.controls.onRowsPerPageChange(pageSizeEvent(25)));
  await act(async () => view.current.controls.onPageChange(null, 1));
  data = [...records, 52];
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 1, count: 52 });
  expect(view.current.items).toEqual(records.slice(25, 50));
  filterKey = 'Completed';
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: 25 });
});

it('clamps removed pages and handles empty results without restoring an obsolete page', async () => {
  let data = records;
  const view = await renderHook(() => usePagination(data));
  await act(async () => view.current.controls.onPageChange(null, 5));
  expect(view.current.items).toEqual([51]);
  data = records.slice(0, 20);
  await view.rerender();
  expect(view.current.controls.page).toBe(1);
  expect(view.current.items).toEqual(data.slice(10));
  data = records;
  await view.rerender();
  expect(view.current.controls.page).toBe(1);
  data = [];
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 0, count: 0 });
  expect(view.current.items).toEqual([]);
});
