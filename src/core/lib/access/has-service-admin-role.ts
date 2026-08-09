/**
 * ユーザーが serviceAdmin（サービス管理者 = 実装会社側）ロールを持つか判定する純関数。
 * クライアントに引き渡す admin ロールとは別に、AI翻訳設定などサービス提供側だけが
 * 触れる領域の判定に使う。
 */
export function hasServiceAdminRole(user: unknown): boolean {
  if (!user || typeof user !== "object") return false
  if (!("roles" in user)) return false

  const roles = user.roles

  return Array.isArray(roles) && roles.includes("serviceAdmin")
}
