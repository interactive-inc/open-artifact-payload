import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "./button"

const meta: Meta<typeof Button> = {
  title: "Shared/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "ボタン",
    variant: "primary",
    size: "md",
    disabled: false,
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: "secondary" },
}

export const Ghost: Story = {
  args: { variant: "ghost" },
}

export const Large: Story = {
  args: { size: "lg", children: "大きめのボタン" },
}

export const Disabled: Story = {
  args: { disabled: true, children: "無効化" },
}
