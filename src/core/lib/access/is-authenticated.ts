import type { Access } from 'payload'

import { isUserAccount } from '@/core/lib/access/is-user-account'

/**
 * Users auth collectionへログイン済みなら通す共通アクセス制御。
 * MCPなど別auth collectionの認証主体はコンテンツ権限へ昇格させない。
 */
export const isAuthenticated: Access = (args) => isUserAccount(args.req.user)
