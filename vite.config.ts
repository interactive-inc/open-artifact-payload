import { defineConfig } from "vite-plus"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // D1は直列実行。DB準備はintegrationだけに限定する。
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          globals: true,
          environment: "node",
          include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
          setupFiles: [],
          globalSetup: [],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          // React Testing Libraryの自動cleanupを有効にする。
          globals: true,
          environment: "node",
          include: ["tests/int/**/*.int.spec.{ts,tsx}", "packages/**/*.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
          globalSetup: ["./vitest.global-setup.ts"],
        },
      },
    ],
  },
  lint: {
    plugins: ["oxc", "typescript", "react", "nextjs"],
    ignorePatterns: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
      ".open-next/**",
      "src/payload-types.ts",
      "src/payload-generated-schema.ts",
      "src/app/(payload)/admin/importMap.js",
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
    // Payload と wrangler が上書きする生成物は、書式を揃えず生成結果を正としてそのままコミットする
    ignorePatterns: [
      "src/payload-types.ts",
      "src/app/(payload)/admin/importMap.js",
      "cloudflare-env.d.ts",
    ],
  },
})
