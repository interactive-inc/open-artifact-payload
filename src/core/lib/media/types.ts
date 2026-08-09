import type { Media } from "@/payload-types"

// upload リレーションは populate 状況により Media オブジェクト・ID・null のいずれかになる。
export type MediaOrId = Media | number | string | null | undefined
