import type { Access } from 'payload'

import { hasAdminRole } from '@/core/lib/access/has-admin-role'
import { hasServiceAdminRole } from '@/core/lib/access/has-service-admin-role'

/**
 * admin（クライアント側管理者）または serviceAdmin（サービス提供側）を通す access。
 * AI翻訳ログのように両者が閲覧する画面に使う。
 */
export const isAdminOrServiceAdmin: Access = (args) =>
  hasAdminRole(args.req.user) || hasServiceAdminRole(args.req.user)
