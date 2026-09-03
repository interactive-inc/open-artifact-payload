import { RESERVED_PAGE_SLUGS } from "@/core/lib/validation/reserved-page-slugs"
import { validateSlug } from "@/core/lib/validation/validate-slug"

/**
 * 汎用ページ用のスラッグ。形式に加えて、テンプレートが持つ固定ルートと
 * 衝突する予約語を拒否する。
 */
export function validatePageSlug(value: string | null | undefined): true | string {
  const slugResult = validateSlug(value)

  if (slugResult !== true) return slugResult

  if (value && RESERVED_PAGE_SLUGS.includes(value)) {
    return `「${value}」はテンプレートが使う予約語のためスラッグに指定できません`
  }

  return true
}
