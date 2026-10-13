import type { Payload } from "payload"

import { canViewAnalytics } from "@/core/lib/analytics/can-view-analytics"

type Props = {
  payload: Payload
  user: unknown
}

/**
 * ダッシュボードの描画前に、解析パネルを出してよいかを判定する。
 * 見られないロールに読み込み中の表示を出さないため、Suspense の外で使う。
 */
export async function loadCanViewAnalytics(props: Props): Promise<boolean> {
  try {
    const settings = await props.payload.findGlobal({ slug: "analytics-settings", depth: 0 })

    return canViewAnalytics({ user: props.user, viewerRoles: settings.viewerRoles ?? [] })
  } catch {
    return false
  }
}
