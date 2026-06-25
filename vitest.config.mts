import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // globals を有効にすると @testing-library/react の自動クリーンアップ (afterEach) が働き、
    // 同一ファイル内で複数回 render しても要素が積み重ならない。
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.{ts,tsx}'],
    fileParallelism: false,
  },
})
