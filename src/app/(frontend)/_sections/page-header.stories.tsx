import type { Meta, StoryObj } from "@storybook/react-vite"

import { PageHeader } from "./page-header"

const meta: Meta<typeof PageHeader> = {
  title: "Shared/Sections/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "会社概要",
  },
}

export default meta

type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: { title: "会社概要" },
}

export const WithDescription: Story = {
  args: {
    title: "会社概要",
    description: "私たちの理念と、これまでの歩みを紹介します。",
  },
}
