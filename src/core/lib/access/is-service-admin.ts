import type { Access } from "payload"

import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"

/**
 * Collection / Global 用の serviceAdmin 限定 access。
 */
export const isServiceAdmin: Access = (args) => hasServiceAdminRole(args.req.user)
