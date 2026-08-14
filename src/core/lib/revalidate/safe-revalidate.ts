import { revalidatePath } from "next/cache"

import type { RevalidateTarget } from "@/core/lib/revalidate/types"

type Props = {
  targets: RevalidateTarget[]
  log: (message: string) => void
}

/**
 * 渡されたパスをまとめて revalidate する。リクエストコンテキスト外などで
 * revalidatePath が throw しても保存処理をブロックしないよう握りつぶしてログに残す。
 */
export function safeRevalidate(props: Props): void {
  for (const target of props.targets) {
    const path = typeof target === "string" ? target : target.path
    const type = typeof target === "string" ? undefined : target.type
    try {
      revalidatePath(path, type)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      props.log(`revalidatePath("${path}") failed: ${reason}`)
    }
  }
}
