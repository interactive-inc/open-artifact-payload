import type { Payload } from "payload"

// pending 予約の有効期限。API タイムアウト（90秒）より十分長く取り、異常終了で
// finalize されなかった行が月末まで上限を消費し続けないようにする
export const pendingStaleMs = 10 * 60 * 1000

// API を呼んだ後に落ちた可能性があるため、費用は予約時の見込み額のまま失敗として残す
const expiredMessage = "タイムアウトにより未確定のまま失効しました"

type Props = {
  payload: Payload
  now: Date
}

/**
 * 有効期限を過ぎた pending の予約行を failed へ回収する。
 * 回収しないまま放置すると、監査ログ上は実行中のまま残り続け、状態の説明もつかなくなる。
 * 失効処理の失敗で翻訳自体を止めないよう、例外は握ってロガーに流すだけにする。
 */
export async function expireStalePendingLogs(props: Props): Promise<void> {
  const staleBeforeIso = new Date(props.now.getTime() - pendingStaleMs).toISOString()

  try {
    await props.payload.update({
      collection: "ai-translation-logs",
      where: {
        and: [{ status: { equals: "pending" } }, { createdAt: { less_than: staleBeforeIso } }],
      },
      data: { status: "failed", errorMessage: expiredMessage },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    props.payload.logger.error(`AI翻訳の失効した予約ログの回収に失敗しました: ${message}`)
  }
}
