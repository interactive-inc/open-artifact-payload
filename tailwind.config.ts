import type { Config } from 'tailwindcss'
import { projectTailwindTheme } from './src/project/theme/tailwind.theme'
import { themeTokens } from './src/core/lib/theme-tokens'

const config: Config = {
  content: [
    './src/app/(frontend)/**/*.{ts,tsx}',
    './src/core/sections/**/*.{ts,tsx}',
    './src/core/frontend/**/*.{ts,tsx}',
    './src/project/pages/**/*.{ts,tsx}',
    './src/project/shared/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: projectTailwindTheme.colors,
      fontFamily: projectTailwindTheme.fontFamily,
      // theme-tokens.ts を Tailwind に配線する (セクション余白・コンテナ幅の単一の真実源)
      spacing: {
        section: themeTokens.spacing.sectionY,
        'section-sm': themeTokens.spacing.sectionYMobile,
      },
      maxWidth: {
        container: themeTokens.container.maxWidth,
        wide: '896px',
        prose: '768px',
      },
    },
  },
  plugins: [],
}

export default config
