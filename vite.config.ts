import { defineConfig } from 'vite-plus'
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
  lint: {
    plugins: ['oxc', 'typescript', 'react', 'nextjs'],
    ignorePatterns: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.open-next/**',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/migrations/**',
      'storybook-static/**',
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    sortPackageJson: false,
    // 自動生成物とベンダーファイルは整形対象外
    ignorePatterns: [
      '.agents/**',
      '**/*.md',
      'cloudflare-env.d.ts',
      'src/payload-types.ts',
      'src/migrations/**',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
})
