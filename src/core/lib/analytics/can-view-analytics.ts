import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"

type Props = {
  user: unknown
  viewerRoles: ReadonlyArray<string>
}

/**
 * アクセス解析を見られるか。サービス管理者は常に見られ、
 * それ以外は設定画面で選ばれたロールを1つでも持っていれば見られる。
 */
export function canViewAnalytics(props: Props): boolean {
  if (hasServiceAdminRole(props.user)) return true

  if (!props.user || typeof props.user !== "object" || !("roles" in props.user)) return false

  const roles = props.user.roles

  return Array.isArray(roles) && roles.some((role) => props.viewerRoles.includes(role))
}
