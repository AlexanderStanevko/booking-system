import { defineConfig } from 'vitest/config';

process.env.TZ = 'Europe/Vilnius';

export default defineConfig({
  test: { environment: 'jsdom' },
});
