import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { hasServiceAdminRole } from '@/core/lib/access/has-service-admin-role'

/**
 * serviceAdmin ロールの付け外しを serviceAdmin 自身に限定する beforeChange hook。
 * クライアントの admin が自分をサービス管理者へ昇格させる事故・悪用を防ぐ。
 * req.user が無い内部処理（初期ユーザー作成・シード・スクリプト）は許可する。
 * Payload の hook は失敗を例外で伝える仕様のため、ここは throw を許容する（ts.md の適用除外）。
 */
export const guardServiceAdminRoleChange: CollectionBeforeChangeHook = (args) => {
  const requestedRoles = Array.isArray(args.data?.roles) ? args.data.roles : null

  if (!requestedRoles) return args.data

  const originalRoles = Array.isArray(args.originalDoc?.roles) ? args.originalDoc.roles : []
  const hadServiceAdmin = originalRoles.includes('serviceAdmin')
  const willHaveServiceAdmin = requestedRoles.includes('serviceAdmin')

  if (hadServiceAdmin === willHaveServiceAdmin) return args.data

  if (!args.req.user) return args.data

  if (!hasServiceAdminRole(args.req.user)) {
    throw new APIError('サービス管理者ロールの変更はサービス管理者のみ行えます', 403)
  }

  return args.data
}
