import type { User } from '@/payload-types'

const userAccountRoles = new Set(['admin', 'editor', 'serviceAdmin'])

/** PayloadのUsers auth collectionに由来する主体だけをコンテンツ操作ユーザーとして扱う。 */
export function isUserAccount(user: unknown): user is User {
  if (!user || typeof user !== 'object') return false
  if (!('email' in user) || typeof user.email !== 'string') return false
  if (!('roles' in user) || !Array.isArray(user.roles)) return false

  return user.roles.some((role) => typeof role === 'string' && userAccountRoles.has(role))
}
