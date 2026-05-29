/**
 * ユーザーが admin ロールを持っているか判定する純関数。
 * Collection access / Field access / 任意ロジック共通で使えるよう型は unknown を受ける。
 */
export function hasAdminRole(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const roles = (user as { roles?: unknown }).roles
  return Array.isArray(roles) && roles.includes('admin')
}
