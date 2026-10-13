import type { AnalyticsErrorKind } from "@/core/lib/analytics/analytics-error-kind"

const MESSAGES: Record<AnalyticsErrorKind, string> = {
  "not-configured": "GA4 が未接続です。",
  "invalid-credentials":
    "サービスアカウントの鍵を読み取れないか、Google に拒否されました。鍵の設定を確認してください。",
  unauthorized:
    "GA4 を閲覧する権限がありません。サービスアカウントが GA4 プロパティに閲覧者として追加されているか確認してください。",
  rejected: "GA4 が問い合わせを受け付けませんでした。プロパティ ID が正しいか確認してください。",
  "rate-limited": "GA4 の呼び出し上限に達しました。しばらくしてから開き直してください。",
  unavailable: "GA4 から応答がありません。しばらくしてから開き直してください。",
  "invalid-response": "GA4 から想定外の応答が返りました。",
}

/** 失敗の種類ごとに、管理画面で次に何をすればよいかを示す文を返す。 */
export function getAnalyticsErrorMessage(kind: AnalyticsErrorKind): string {
  return MESSAGES[kind]
}
