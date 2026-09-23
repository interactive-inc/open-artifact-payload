import type { FieldAccess } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"

/**
 * Field 用の管理者 access（admin / serviceAdmin）。Collection 用とは型シグネチャが別。
 */
export const isAdminField: FieldAccess = (args) => hasAdminRole(args.req.user)
