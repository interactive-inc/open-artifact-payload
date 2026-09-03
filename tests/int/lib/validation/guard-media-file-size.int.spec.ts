import { describe, expect, it } from "vite-plus/test"

import { guardMediaFileSize } from "@/core/lib/validation/guard-media-file-size"
import { MEDIA_MAX_FILE_SIZE_BYTES } from "@/core/lib/validation/media-limits"

// Payload の hook 引数は巨大なため、参照するプロパティだけの部分モックを組む（ts.md のテスト適用除外）。
function createHookArgs(size: number | null) {
  const file = size === null ? undefined : { size }

  return { data: { alt: "テスト" }, req: { file } }
}

function callGuard(size: number | null) {
  const args = createHookArgs(size)

  return guardMediaFileSize(args as unknown as Parameters<typeof guardMediaFileSize>[0])
}

describe("guardMediaFileSize", () => {
  it("ファイルが無い更新は素通しする", () => {
    expect(callGuard(null)).toEqual({ alt: "テスト" })
  })

  it("上限ちょうどのファイルを通す", () => {
    expect(callGuard(MEDIA_MAX_FILE_SIZE_BYTES)).toEqual({ alt: "テスト" })
  })

  it("上限を 1 バイト超えたファイルを拒否する", () => {
    expect(() => callGuard(MEDIA_MAX_FILE_SIZE_BYTES + 1)).toThrow()
  })
})
