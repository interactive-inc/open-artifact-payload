import type { Field, Payload } from 'payload'

type Props = {
  payload: Payload
  targetKind: 'collection' | 'global'
  targetSlug: string
}

type TranslationTarget = {
  fields: Field[]
  hasDrafts: boolean
}

/**
 * 翻訳対象エンティティのフィールド定義とドラフト有無を config から解決する。
 * config に存在しない slug は Error（サーバー側 config が唯一の allowlist）。
 */
export function resolveTranslationTarget(props: Props): TranslationTarget | Error {
  if (props.targetKind === 'collection') {
    const collection = props.payload.config.collections.find(
      (candidate) => candidate.slug === props.targetSlug,
    )

    if (!collection) return new Error('翻訳対象が見つかりません')

    return {
      fields: collection.fields,
      hasDrafts: Boolean(collection.versions?.drafts),
    }
  }

  const globalConfig = props.payload.config.globals.find(
    (candidate) => candidate.slug === props.targetSlug,
  )

  if (!globalConfig) return new Error('翻訳対象が見つかりません')

  return {
    fields: globalConfig.fields,
    hasDrafts: Boolean(globalConfig.versions?.drafts),
  }
}
