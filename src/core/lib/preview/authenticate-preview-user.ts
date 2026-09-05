import type { Payload } from "payload"

import { isUserAccountSession } from "@/core/lib/access/is-user-account"
import type { User } from "@/payload-types"

export async function authenticatePreviewUser(
  payload: Pick<Payload, "auth">,
  headers: Headers,
): Promise<User | null> {
  const { user } = await payload.auth({ headers })
  return isUserAccountSession(user) ? user : null
}
