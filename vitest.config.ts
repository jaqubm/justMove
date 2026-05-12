import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
    },
  },
  resolve: {
    alias: {
      // Native modules that can't run in Node — swapped for minimal stubs
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        '__mocks__/async-storage.ts'
      ),
      'react-native-url-polyfill/auto': path.resolve(
        __dirname,
        '__mocks__/url-polyfill.ts'
      ),
    },
  },
});
