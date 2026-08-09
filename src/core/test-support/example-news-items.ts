import type { News } from "@/payload-types"

// Storybook / テスト用のサンプルお知らせ一覧 (populate 済みの News オブジェクト)。
export const exampleNewsItems: News[] = [
  {
    id: 1,
    title: "新サービスを開始しました",
    slug: "new-service",
    publishedAt: "2026-06-01T00:00:00.000Z",
    category: "info",
    body: null,
    _status: "published",
    updatedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "プレスリリースの例",
    slug: "press-example",
    publishedAt: "2026-05-15T00:00:00.000Z",
    category: "press",
    body: null,
    _status: "published",
    updatedAt: "2026-05-15T00:00:00.000Z",
    createdAt: "2026-05-15T00:00:00.000Z",
  },
  {
    id: 3,
    title: "イベント開催のお知らせ",
    slug: "event-example",
    publishedAt: "2026-04-20T00:00:00.000Z",
    category: "event",
    body: null,
    _status: "published",
    updatedAt: "2026-04-20T00:00:00.000Z",
    createdAt: "2026-04-20T00:00:00.000Z",
  },
]
