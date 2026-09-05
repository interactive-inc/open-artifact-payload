import type { Access } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"
import { isUserAccount } from "@/core/lib/access/is-user-account"

/** ロック解除もユーザー管理操作。サービス管理者の保護を対象条件で適用する。 */
export const unlockUsers: Access = async ({ req }) => {
  if (!isUserAccount(req.user)) return false
  if (hasServiceAdminRole(req.user)) return true
  if (!hasAdminRole(req.user)) return false

  // hasManyロールの否定条件は別のロール行に一致することがあるため、
  // 保護ロールを持つユーザーを正の条件で取得し、そのIDを除外する。
  const protectedUsers = await req.payload.find({
    collection: "users",
    where: { roles: { equals: "serviceAdmin" } },
    // idは常に返る。認証情報を復号・取得しないようロールだけを選択する。
    select: { roles: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const ids = protectedUsers.docs.map((user) => user.id)
  return ids.length === 0 ? true : { id: { not_in: ids } }
}
