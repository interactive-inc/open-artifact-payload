import { readGa4ServiceAccount } from "@/core/lib/analytics/read-ga4-service-account"

/** 鍵の状態を説明する文。鍵の中身は出さず、GA4 に追加するメールアドレスだけを示す。 */
export function describeGa4ServiceAccount(json: string | undefined): string {
  const account = readGa4ServiceAccount(json)

  if (!(account instanceof Error)) return `設定済み（${account.clientEmail}）`

  if (account.kind === "not-configured") return "未設定（環境変数 GA4_SERVICE_ACCOUNT_JSON）"

  return "読み取れません。サービスアカウントの鍵 JSON をそのまま設定してください"
}
