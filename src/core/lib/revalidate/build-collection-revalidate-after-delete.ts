import type { CollectionAfterDeleteHook } from 'payload'

import type { CollectionPathResolver } from '@/core/lib/revalidate/types'
import { safeRevalidate } from '@/core/lib/revalidate/safe-revalidate'

/**
 * コレクション削除後に resolver が返したパスをまとめて revalidate する汎用 hook。
 */
export function buildCollectionRevalidateAfterDelete<T = Record<string, unknown>>(
  resolver: CollectionPathResolver<T>,
): CollectionAfterDeleteHook {
  return (args) => {
    const log = (message: string) => args.req.payload.logger.warn(message)
    safeRevalidate({ targets: resolver({ doc: args.doc }), log })
    return args.doc
  }
}
