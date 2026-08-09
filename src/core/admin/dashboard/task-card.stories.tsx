import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TaskCard } from "@/core/admin/dashboard/task-card"
import "./dashboard-view.css"

const meta: Meta<typeof TaskCard> = {
  title: "Core/Admin/TaskCard",
  component: TaskCard,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["large", "small"],
    },
  },
}

export default meta

type Story = StoryObj<typeof TaskCard>

export const Large: Story = {
  args: {
    size: "large",
    task: {
      id: "add-news",
      icon: "megaphone",
      label: "お知らせを追加する",
      description: "新しいお知らせを作成して公開します",
      href: "/admin/collections/news/create",
      priority: "primary",
    },
  },
}

export const Small: Story = {
  args: {
    size: "small",
    task: {
      id: "check-contact",
      icon: "mail",
      label: "問い合わせを確認する",
      href: "/admin/collections/contact-submissions",
    },
  },
}

export const WithoutDescription: Story = {
  args: {
    size: "large",
    task: {
      id: "site-settings",
      icon: "settings",
      label: "サイト設定を編集する",
      href: "/admin/globals/site-settings",
    },
  },
}
