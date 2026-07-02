import type { CollectionAfterChangeHook } from 'payload'

import type { CollectionPathResolver } from '@/core/lib/revalidate/types'
import { safeRevalidate } from '@/core/lib/revalidate/safe-revalidate'

/**
 * コレクション保存後に resolver が返したパスをまとめて revalidate する汎用 hook。
 */
export function buildCollectionRevalidateAfterChange<T = Record<string, unknown>>(
  resolver: CollectionPathResolver<T>,
): CollectionAfterChangeHook {
  return (args) => {
    const log = (message: string) => args.req.payload.logger.warn(message)
    safeRevalidate({ targets: resolver({ doc: args.doc, previousDoc: args.previousDoc }), log })
    return args.doc
  }
}
