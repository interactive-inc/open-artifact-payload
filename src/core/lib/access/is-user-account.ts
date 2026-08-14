import type { User } from "@/payload-types"

const userAccountRoles = new Set(["admin", "editor", "serviceAdmin"])

/** PayloadのUsers auth collectionに由来する主体だけをコンテンツ操作ユーザーとして扱う。 */
export function isUserAccount(user: unknown): user is User {
  if (!user || typeof user !== "object") return false
  if (!("collection" in user) || user.collection !== "users") return false
  if (!("email" in user) || typeof user.email !== "string") return false
  if (!("roles" in user) || !Array.isArray(user.roles)) return false

  return user.roles.some((role) => typeof role === "string" && userAccountRoles.has(role))
}

/** 管理画面の通常ログインで発行されたセッションだけを扱う。Users API Key は含めない。 */
export function isUserAccountSession(user: unknown): user is User {
  return (
    isUserAccount(user) &&
    "_strategy" in user &&
    typeof user._strategy === "string" &&
    user._strategy === "local-jwt"
  )
}
