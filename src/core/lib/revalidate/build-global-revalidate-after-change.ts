import type { GlobalAfterChangeHook } from 'payload'

import type { GlobalPathResolver } from '@/core/lib/revalidate/types'
import { safeRevalidate } from '@/core/lib/revalidate/safe-revalidate'

/**
 * Global 保存後に resolver が返したパスを revalidate する汎用 hook。
 */
export function buildGlobalRevalidateAfterChange(
  resolver: GlobalPathResolver,
): GlobalAfterChangeHook {
  return (args) => {
    const log = (message: string) => args.req.payload.logger.warn(message)
    safeRevalidate({ targets: resolver(), log })
    return args.doc
  }
}
