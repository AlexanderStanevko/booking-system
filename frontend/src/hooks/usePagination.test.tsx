import { act, type ChangeEvent } from 'react';
import { expect, it } from 'vitest';
import { renderHook } from '@/test/renderHook';
import { usePagination } from './usePagination';

const records = Array.from({ length: 51 }, (_, index) => index + 1);
const pageSizeEvent = (size: number) =>
  ({ target: { value: String(size) } }) as ChangeEvent<HTMLInputElement>;

it('starts on page zero with ten records and the filtered total', async () => {
  const view = await renderHook(() => usePagination(records));
  expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: 10, count: 51 });
  expect(view.current.items).toEqual(records.slice(0, 10));
});

it('switches pages without changing the source ordering', async () => {
  const view = await renderHook(() => usePagination(records));
  await act(async () => view.current.controls.onPageChange(null, 1));
  expect(view.current.items).toEqual(records.slice(10, 20));
  await act(async () => view.current.controls.onPageChange(null, 0));
  expect(view.current.items).toEqual(records.slice(0, 10));
});

it.each([25, 50])('resets the page when the page size changes to %i', async (size) => {
  const view = await renderHook(() => usePagination(records));
  await act(async () => view.current.controls.onPageChange(null, 2));
  await act(async () => view.current.controls.onRowsPerPageChange(pageSizeEvent(size)));
  expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: size });
  expect(view.current.items).toEqual(records.slice(0, size));
});

it('resets changed filters while preserving the page size', async () => {
  let filterKey = 'Booked';
  const view = await renderHook(() => usePagination(records, filterKey));
  await act(async () => view.current.controls.onRowsPerPageChange(pageSizeEvent(25)));
  await act(async () => view.current.controls.onPageChange(null, 1));
  await view.rerender();
  expect(view.current.controls.page).toBe(1);
  filterKey = 'Completed';
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 0, rowsPerPage: 25 });
});

it('keeps a valid page after refreshed data replaces the original array', async () => {
  let data = records;
  const view = await renderHook(() => usePagination(data));
  await act(async () => view.current.controls.onPageChange(null, 1));
  data = [...records, 52];
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 1, count: 52 });
  expect(view.current.items).toEqual(records.slice(10, 20));
});

it('moves to the last valid page after removal and keeps it if records return', async () => {
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
});

it('handles empty results without a negative page', async () => {
  let data = records;
  const view = await renderHook(() => usePagination(data));
  await act(async () => view.current.controls.onPageChange(null, 3));
  data = [];
  await view.rerender();
  expect(view.current.controls).toMatchObject({ page: 0, count: 0 });
  expect(view.current.items).toEqual([]);
});
