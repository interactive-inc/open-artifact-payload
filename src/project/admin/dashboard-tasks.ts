import type { DashboardTask } from "@/core/admin/dashboard/types"

export const dashboardTasks: DashboardTask[] = [
  {
    id: "add-news",
    icon: "megaphone",
    label: "お知らせを追加する",
    description: "新しいお知らせを投稿します",
    href: "/admin/collections/news/create",
    priority: "primary",
  },
  {
    id: "manage-media",
    icon: "image",
    label: "画像を差し替える",
    description: "サイトで使う画像を管理します",
    href: "/admin/collections/media",
    priority: "secondary",
  },
  {
    id: "check-contact",
    icon: "mail",
    label: "問い合わせを確認する",
    description: "届いている問い合わせを確認します",
    href: "/admin/collections/contact-submissions",
    priority: "secondary",
  },
]
