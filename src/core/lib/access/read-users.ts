import type { Access } from 'payload'

import { hasAdminRole } from '@/core/lib/access/has-admin-role'
import { hasServiceAdminRole } from '@/core/lib/access/has-service-admin-role'
import { isUserAccount } from '@/core/lib/access/is-user-account'

/**
 * 管理ロールはユーザー一覧を、自身以外は自分の行だけを閲覧できる。
 * 認証コレクションが持つAPI Keyを他ユーザーへ漏らさないための境界でもある。
 */
export const readUsers: Access = (args) => {
  if (hasAdminRole(args.req.user) || hasServiceAdminRole(args.req.user)) return true
  if (!isUserAccount(args.req.user)) return false

  return {
    id: {
      equals: args.req.user.id,
    },
  }
}
