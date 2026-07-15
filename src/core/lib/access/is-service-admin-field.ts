import type { FieldAccess } from 'payload'

import { hasServiceAdminRole } from '@/core/lib/access/has-service-admin-role'

/**
 * Field 用の serviceAdmin 限定 access。Collection 用とは型シグネチャが別。
 */
export const isServiceAdminField: FieldAccess = (args) => hasServiceAdminRole(args.req.user)
