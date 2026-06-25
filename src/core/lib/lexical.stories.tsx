import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { exampleRichText } from '@/core/test-support/example-rich-text'

import { RichText } from './lexical'

const meta: Meta<typeof RichText> = {
  title: 'Core/Lexical/RichText',
  component: RichText,
  tags: ['autodocs'],
  args: {
    data: exampleRichText,
  },
}

export default meta

type Story = StoryObj<typeof RichText>

export const Default: Story = {}

export const Empty: Story = {
  args: { data: null },
}
