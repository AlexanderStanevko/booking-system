import { act, useState, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material';
import { expect, it, vi } from 'vitest';
import { renderHook } from '@/test/renderHook';
import { theme } from '@/theme/theme';
import { SelectFilter } from './SelectFilter';

it('searches and clears a controlled filter without applying it implicitly', async () => {
  const onChange = vi.fn();
  function Wrapper({ children }: { children: ReactNode }) {
    const [value, setValue] = useState('');
    return (
      <ThemeProvider theme={theme}>
        <SelectFilter
          searchable
          label="Room"
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
          options={[
            { value: 'amber', label: 'Amber' },
            { value: 'birch', label: 'Birch' },
          ]}
          emptyLabel="All rooms"
        />
        {children}
      </ThemeProvider>
    );
  }
  await renderHook(() => null, Wrapper);
  const input = document.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  expect(input.value).toBe('All rooms');
  await act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'bir');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(onChange).not.toHaveBeenCalled();
  expect([...document.querySelectorAll('[role="option"]')].map((item) => item.textContent)).toEqual(
    ['Birch'],
  );
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  });
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  expect(input.value).toBe('Birch');
  expect(onChange).toHaveBeenLastCalledWith('birch');
  const clear = document.querySelector<HTMLButtonElement>('button[title="Clear"]')!;
  await act(async () => clear.click());
  expect(input.value).toBe('All rooms');
  expect(onChange).toHaveBeenLastCalledWith('');
});

it('keeps all-status selection available in the MUI menu', async () => {
  const onChange = vi.fn();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <SelectFilter
          label="Status"
          value="Booked"
          onChange={onChange}
          options={[{ value: 'Booked', label: 'Booked' }]}
          emptyLabel="All statuses"
        />
        {children}
      </ThemeProvider>
    );
  }
  await renderHook(() => null, Wrapper);
  const select = document.querySelector<HTMLElement>('[role="combobox"]')!;
  await act(async () => select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
  const all = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (item) => item.textContent === 'All statuses',
  )!;
  await act(async () => all.click());
  expect(onChange).toHaveBeenCalledWith('');
});
