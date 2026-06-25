import React from 'react'
import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'

import '../src/app/(frontend)/styles.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111111' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    (Story) => (
      <div className="font-sans antialiased text-foreground">
        <Story />
      </div>
    ),
  ],
}

export default preview
