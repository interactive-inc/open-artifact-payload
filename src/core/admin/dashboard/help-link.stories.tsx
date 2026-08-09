import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import "./dashboard-view.css"

import { HelpLink } from "@/core/admin/dashboard/help-link"

const meta: Meta<typeof HelpLink> = {
  title: "Core/Admin/HelpLink",
  component: HelpLink,
  tags: ["autodocs"],
  args: {
    email: "support@example.com",
  },
}

export default meta

type Story = StoryObj<typeof HelpLink>

export const Default: Story = {}
