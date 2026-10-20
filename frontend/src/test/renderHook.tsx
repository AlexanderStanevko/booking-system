import { act, type ComponentType, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach } from 'vitest';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const cleanups = new Set<() => Promise<void>>();
afterEach(async () => {
  for (const cleanup of cleanups) await cleanup();
});

export async function renderHook<T>(
  hook: () => T,
  Wrapper?: ComponentType<{ children: ReactNode }>,
) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  let value: T | undefined;
  function Harness() {
    value = hook();
    return null;
  }
  async function rerender() {
    await act(async () => {
      root.render(
        Wrapper ? (
          <Wrapper>
            <Harness />
          </Wrapper>
        ) : (
          <Harness />
        ),
      );
    });
  }
  async function unmount() {
    if (!cleanups.delete(unmount)) return;
    await act(async () => root.unmount());
    container.remove();
  }
  cleanups.add(unmount);
  await rerender();
  return {
    get current() {
      if (value === undefined) throw new Error('The hook has not rendered.');
      return value;
    },
    rerender,
    unmount,
  };
}
