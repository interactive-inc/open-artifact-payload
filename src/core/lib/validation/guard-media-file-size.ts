import { APIError, type CollectionBeforeValidateHook } from "payload"

import {
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_MAX_FILE_SIZE_MEGABYTES,
} from "@/core/lib/validation/media-limits"

/**
 * アップロードされたファイルのバイト数を保存前に止める。
 * REST の multipart は config.upload.limits で切られるが、Local API / MCP / CLI は
 * その経路を通らないため、コレクション側でも同じ上限を掛ける。
 * Payload の hook は失敗を例外で伝える仕様のため、ここは throw を許容する（ts.md の適用除外）。
 */
export const guardMediaFileSize: CollectionBeforeValidateHook = (args) => {
  const file = args.req.file

  if (!file) return args.data

  if (file.size > MEDIA_MAX_FILE_SIZE_BYTES) {
    throw new APIError(`ファイルサイズは${MEDIA_MAX_FILE_SIZE_MEGABYTES}MB以内にしてください`, 413)
  }

  return args.data
}
