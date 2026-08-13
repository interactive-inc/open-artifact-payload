import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"

const mock = (fileName: string) => fileURLToPath(new URL(`./mocks/${fileName}`, import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/core/**/*.stories.@(ts|tsx|mdx)", "../src/project/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  viteFinal: async (viteConfig) => {
    const configuredAliases = viteConfig.resolve?.alias
    const aliases = Array.isArray(configuredAliases)
      ? configuredAliases
      : Object.entries(configuredAliases ?? {}).map(([find, replacement]) => ({
          find,
          replacement,
        }))

    viteConfig.resolve = {
      ...viteConfig.resolve,
      // @storybook/react-vite does not install Next's Storybook preset. Keep the
      // dependency-safe framework and provide the browser-facing Next modules
      // used by our stories locally instead.
      alias: [
        ...aliases,
        { find: /^next\/image(?:\.js)?$/, replacement: mock("next-image.tsx") },
        { find: /^next\/link(?:\.js)?$/, replacement: mock("next-link.tsx") },
        { find: /^next\/navigation(?:\.js)?$/, replacement: mock("next-navigation.ts") },
        { find: /^next\/script(?:\.js)?$/, replacement: mock("next-script.tsx") },
      ],
    }
    return viteConfig
  },
}

export default config
