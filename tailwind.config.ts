import type { Config } from 'tailwindcss'
import { projectTailwindTheme } from './src/project/theme/tailwind.theme'

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
    extend: projectTailwindTheme,
  },
  plugins: [],
}

export default config
