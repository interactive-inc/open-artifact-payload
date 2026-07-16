import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { hasServiceAdminRole } from '@/core/lib/access/has-service-admin-role'

/**
 * serviceAdmin アカウントの削除を serviceAdmin 自身に限定する。
 * クライアント admin がサービス管理者アカウントを削除して AI翻訳設定を
 * 誰も管理できない状態にすることを防ぐ。req.user が無い内部処理は許可する。
 * Payload の hook は失敗を例外で伝える仕様のため、ここは throw を許容する（ts.md の適用除外）。
 */
export const guardServiceAdminAccountDelete: CollectionBeforeDeleteHook = async (args) => {
  if (!args.req.user) return

  if (hasServiceAdminRole(args.req.user)) return

  const targetUser = await args.req.payload.findByID({
    collection: 'users',
    id: args.id,
    depth: 0,
  })

  if (Array.isArray(targetUser.roles) && targetUser.roles.includes('serviceAdmin')) {
    throw new APIError('サービス管理者アカウントを削除できるのはサービス管理者のみです', 403)
  }
}
