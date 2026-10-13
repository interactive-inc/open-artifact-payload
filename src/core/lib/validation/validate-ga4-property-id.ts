const PROPERTY_ID_PATTERN = /^[0-9]{1,20}$/

/**
 * GA4 のプロパティ ID（数字だけ）。計測タグに使う G- から始まる測定 ID とよく取り違えるため、
 * その場合は違いを伝える。
 */
export function validateGa4PropertyId(value: string | null | undefined): true | string {
  if (!value) return true

  if (/^G-/i.test(value)) {
    return "G- から始まる測定 ID ではなく、GA4 の「管理 > プロパティの詳細」にある数字だけのプロパティ ID を入力してください"
  }

  if (!PROPERTY_ID_PATTERN.test(value)) {
    return "プロパティ ID は20桁以内の数字だけで入力してください"
  }

  return true
}
