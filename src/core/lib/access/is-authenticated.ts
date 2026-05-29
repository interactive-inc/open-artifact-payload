import type { Access } from 'payload'

/**
 * ログイン済みなら通す共通アクセス制御。
 */
export const isAuthenticated: Access = ({ req }) => Boolean(req.user)
