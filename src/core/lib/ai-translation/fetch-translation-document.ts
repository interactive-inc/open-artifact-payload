import type { Payload, TypedLocale } from 'payload'

import { isCollectionSlug } from '@/core/lib/ai-translation/is-collection-slug'
import { isGlobalSlug } from '@/core/lib/ai-translation/is-global-slug'
import type { User } from '@/payload-types'

type Props = {
  payload: Payload
  user: User
  targetKind: 'collection' | 'global'
  targetSlug: string
  targetId: string | null
  locale: TypedLocale
}

/**
 * 翻訳対象ドキュメントを指定 locale・fallback 無効で取得する（未入力判定を正確にするため）。
 * overrideAccess: false + user で Payload のアクセス制御に乗せる。
 * 最新の下書き内容を翻訳対象にするため draft: true で読む。
 */
export async function fetchTranslationDocument(props: Props): Promise<object | Error> {
  try {
    if (props.targetKind === 'collection') {
      if (!isCollectionSlug(props.payload, props.targetSlug) || props.targetId === null) {
        return new Error('翻訳対象が見つかりません')
      }

      return await props.payload.findByID({
        collection: props.targetSlug,
        id: props.targetId,
        locale: props.locale,
        fallbackLocale: false,
        draft: true,
        depth: 0,
        overrideAccess: false,
        user: props.user,
      })
    }

    if (!isGlobalSlug(props.payload, props.targetSlug)) {
      return new Error('翻訳対象が見つかりません')
    }

    return await props.payload.findGlobal({
      slug: props.targetSlug,
      locale: props.locale,
      fallbackLocale: false,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user: props.user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return new Error(`対象ドキュメントを取得できませんでした（存在と権限を確認してください）: ${message}`)
  }
}
