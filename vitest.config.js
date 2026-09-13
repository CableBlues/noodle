import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
