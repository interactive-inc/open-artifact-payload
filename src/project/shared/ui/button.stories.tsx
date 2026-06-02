import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ArrowRightIcon, MailIcon } from 'lucide-react'

import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'ボタン',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: '削除する' },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        詳細を見る
        <ArrowRightIcon data-icon="inline-end" />
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <MailIcon />,
    'aria-label': 'メール',
  },
}

export const Large: Story = {
  args: { size: 'lg', children: 'お問い合わせする' },
}

export const Disabled: Story = {
  args: { disabled: true, children: '無効化' },
}
