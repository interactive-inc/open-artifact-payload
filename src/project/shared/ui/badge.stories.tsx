import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "./badge"

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "secondary", "outline", "destructive"],
    },
  },
  args: {
    children: "お知らせ",
    variant: "default",
  },
}

export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {}
export const Secondary: Story = { args: { variant: "secondary" } }
export const Outline: Story = { args: { variant: "outline" } }
export const Destructive: Story = { args: { variant: "destructive", children: "削除" } }
