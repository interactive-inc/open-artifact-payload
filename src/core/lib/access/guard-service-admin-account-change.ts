import { APIError, type CollectionBeforeChangeHook } from "payload"

import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"

/**
 * serviceAdmin アカウントの保護。serviceAdmin 以外のユーザーは
 * 1. serviceAdmin を持つユーザーの更新（パスワード・メール変更による乗っ取り防止）
 * 2. serviceAdmin ロールの付与
 * のいずれもできない。req.user が無い内部処理（初期ユーザー作成・シード・スクリプト）は許可する。
 * Payload の hook は失敗を例外で伝える仕様のため、ここは throw を許容する（ts.md の適用除外）。
 */
export const guardServiceAdminAccountChange: CollectionBeforeChangeHook = (args) => {
  if (!args.req.user) return args.data

  if (hasServiceAdminRole(args.req.user)) return args.data

  const originalRoles = Array.isArray(args.originalDoc?.roles) ? args.originalDoc.roles : []

  if (originalRoles.includes("serviceAdmin")) {
    throw new APIError("サービス管理者アカウントを変更できるのはサービス管理者のみです", 403)
  }

  const requestedRoles = Array.isArray(args.data?.roles) ? args.data.roles : null

  if (requestedRoles && requestedRoles.includes("serviceAdmin")) {
    throw new APIError("サービス管理者ロールの変更はサービス管理者のみ行えます", 403)
  }

  return args.data
}
