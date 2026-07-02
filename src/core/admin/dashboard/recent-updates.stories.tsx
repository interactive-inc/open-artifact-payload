import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { exampleNewsItems } from '@/core/test-support/example-news-items'

import { RecentUpdates } from './recent-updates'
import './dashboard-view.css'

const meta: Meta<typeof RecentUpdates> = {
  title: 'Core/Admin/RecentUpdates',
  component: RecentUpdates,
  tags: ['autodocs'],
  args: {
    items: exampleNewsItems,
  },
}

export default meta

type Story = StoryObj<typeof RecentUpdates>

export const WithItems: Story = {
  args: { items: exampleNewsItems },
}

export const Empty: Story = {
  args: { items: [] },
}
