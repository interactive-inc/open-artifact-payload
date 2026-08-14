import { defineConfig } from "vite-plus"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // globals を有効にすると @testing-library/react の自動クリーンアップ (afterEach) が働き、
    // 同一ファイル内で複数回 render しても要素が積み重ならない。
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    include: ["tests/int/**/*.int.spec.{ts,tsx}", "packages/**/*.test.ts"],
    fileParallelism: false,
  },
  lint: {
    plugins: ["oxc", "typescript", "react", "nextjs"],
    ignorePatterns: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".open-next/**",
      "src/payload-types.ts",
      "src/payload-generated-schema.ts",
      "src/migrations/**",
      "storybook-static/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: false,
    ignorePatterns: ["src/payload-types.ts"],
  },
})
