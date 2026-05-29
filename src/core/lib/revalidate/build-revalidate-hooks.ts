import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

type CollectionPathResolver<T = Record<string, unknown>> = (args: {
  doc: T
  previousDoc?: T
}) => string[]

type GlobalPathResolver = () => string[]

function safeRevalidate(paths: string[], log: (message: string) => void): void {
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      log(`revalidatePath("${path}") failed: ${reason}`)
    }
  }
}

/**
 * コレクション保存後に渡されたパスをまとめて revalidate する汎用 hook。
 * resolver は更新後ドキュメントを受け取り、対象パスの配列を返す。
 */
export function buildCollectionRevalidateAfterChange<T = Record<string, unknown>>(
  resolver: CollectionPathResolver<T>,
): CollectionAfterChangeHook {
  return ({ doc, previousDoc, req }) => {
    const log = (message: string) => req.payload.logger.warn(message)
    safeRevalidate(resolver({ doc, previousDoc }), log)
    return doc
  }
}

/**
 * コレクション削除後に渡されたパスをまとめて revalidate する汎用 hook。
 */
export function buildCollectionRevalidateAfterDelete<T = Record<string, unknown>>(
  resolver: CollectionPathResolver<T>,
): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    const log = (message: string) => req.payload.logger.warn(message)
    safeRevalidate(resolver({ doc }), log)
    return doc
  }
}

/**
 * Global 保存後にパスを revalidate する hook。
 */
export function buildGlobalRevalidateAfterChange(resolver: GlobalPathResolver): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    const log = (message: string) => req.payload.logger.warn(message)
    safeRevalidate(resolver(), log)
    return doc
  }
}
