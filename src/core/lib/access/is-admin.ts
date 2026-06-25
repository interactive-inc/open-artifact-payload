import type { Access } from 'payload'

import { hasAdminRole } from '@/core/lib/access/has-admin-role'

/**
 * Collection 用の admin 限定 access。
 */
export const isAdmin: Access = (args) => hasAdminRole(args.req.user)
