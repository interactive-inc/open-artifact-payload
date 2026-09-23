import type { Access } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"

/**
 * Collection 用の管理者 access（admin / serviceAdmin）。
 */
export const isAdmin: Access = (args) => hasAdminRole(args.req.user)
