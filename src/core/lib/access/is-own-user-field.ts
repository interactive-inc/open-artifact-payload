import type { FieldAccess } from "payload"

import { isUserAccount } from "@/core/lib/access/is-user-account"

/** ユーザー一覧の閲覧権限と、認証情報の閲覧権限を分離する。 */
export const isOwnUserField: FieldAccess = ({ id, req }) =>
  isUserAccount(req.user) && id !== undefined && req.user.id === id
