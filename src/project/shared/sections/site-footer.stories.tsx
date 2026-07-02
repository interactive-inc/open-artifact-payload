import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { exampleSiteSettings } from '@/core/test-support/example-site-settings'

import { SiteFooter } from './site-footer'

const meta: Meta<typeof SiteFooter> = {
  title: 'Shared/Sections/SiteFooter',
  component: SiteFooter,
  tags: ['autodocs'],
  args: {
    settings: exampleSiteSettings,
  },
}

export default meta

type Story = StoryObj<typeof SiteFooter>

export const Default: Story = {
  args: { settings: exampleSiteSettings },
}
