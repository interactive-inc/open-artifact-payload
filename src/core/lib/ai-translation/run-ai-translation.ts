import type { Payload } from 'payload'

import { applyTranslatedFields } from '@/core/lib/ai-translation/apply-translated-fields'
import { checkUsageLimits } from '@/core/lib/ai-translation/check-usage-limits'
import { createAiTranslationLog } from '@/core/lib/ai-translation/create-ai-translation-log'
import { estimateTranslationCost } from '@/core/lib/ai-translation/estimate-translation-cost'
import { extractTranslatableFields } from '@/core/lib/ai-translation/extract-translatable-fields'
import { fetchTranslationDocument } from '@/core/lib/ai-translation/fetch-translation-document'
import { filterUntranslatedFields } from '@/core/lib/ai-translation/filter-untranslated-fields'
import { guardTranslations } from '@/core/lib/ai-translation/guard-translations'
import { isTypedLocale } from '@/core/lib/ai-translation/is-typed-locale'
import { loadTranslationSettings } from '@/core/lib/ai-translation/load-translation-settings'
import { loadUsageSnapshot } from '@/core/lib/ai-translation/load-usage-snapshot'
import type { AiTranslateRequest } from '@/core/lib/ai-translation/parse-ai-translate-request'
import { resolveTranslateFn } from '@/core/lib/ai-translation/resolve-translate-fn'
import { resolveTranslationTarget } from '@/core/lib/ai-translation/resolve-translation-target'
import type { TranslateFn } from '@/core/lib/ai-translation/translation-types'
import { updateTranslatedDocument } from '@/core/lib/ai-translation/update-translated-document'
import type { User } from '@/payload-types'

type Props = {
  payload: Payload
  user: User
  request: AiTranslateRequest
  // テスト・将来のプロバイダ差し替え用 DI。省略時は設定のモデルから解決する
  translateFn?: TranslateFn
  now?: Date
}

export type AiTranslationSummary = {
  status: 'succeeded' | 'skipped'
  translatedFieldCount: number
  skippedFieldCount: number
  characterCount: number
  message: string
}

/**
 * AI翻訳の一連の流れ（設定確認 → 権限付き取得 → 抽出 → 上限判定 → 翻訳 → 検証 → 保存 → 監査ログ）。
 * どの段階で失敗しても既存データは変更せず、Error を返す。
 */
export async function runAiTranslation(props: Props): Promise<AiTranslationSummary | Error> {
  const now = props.now ?? new Date()
  const request = props.request

  const settings = await loadTranslationSettings(props.payload)

  if (settings instanceof Error) return settings

  const localization = props.payload.config.localization

  if (!localization) return new Error('多言語設定が無効のため翻訳できません')

  const sourceLocaleCode = localization.defaultLocale
  const targetLocaleCode = request.targetLocale

  if (!isTypedLocale(props.payload, sourceLocaleCode)) {
    return new Error('翻訳元言語の設定が不正です')
  }

  if (!isTypedLocale(props.payload, targetLocaleCode) || targetLocaleCode === sourceLocaleCode) {
    return new Error('翻訳先言語が不正です')
  }

  const sourceLocaleConfig = localization.locales.find((entry) => entry.code === sourceLocaleCode)
  const targetLocaleConfig = localization.locales.find((entry) => entry.code === targetLocaleCode)
  const sourceLocaleLabel =
    typeof sourceLocaleConfig?.label === 'string' ? sourceLocaleConfig.label : sourceLocaleCode
  const targetLocaleLabel =
    typeof targetLocaleConfig?.label === 'string' ? targetLocaleConfig.label : targetLocaleCode

  const target = resolveTranslationTarget({
    payload: props.payload,
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
  })

  if (target instanceof Error) return target

  const sourceDoc = await fetchTranslationDocument({
    payload: props.payload,
    user: props.user,
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    locale: sourceLocaleCode,
  })

  if (sourceDoc instanceof Error) return sourceDoc

  const extractedFields = extractTranslatableFields({
    fields: target.fields,
    sourceData: sourceDoc,
  })

  if (extractedFields.length === 0) {
    return {
      status: 'skipped',
      translatedFieldCount: 0,
      skippedFieldCount: 0,
      characterCount: 0,
      message: '翻訳対象のフィールドがありません',
    }
  }

  const targetDoc = await fetchTranslationDocument({
    payload: props.payload,
    user: props.user,
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    locale: targetLocaleCode,
  })

  if (targetDoc instanceof Error) return targetDoc

  const pendingFields = request.overwrite
    ? [...extractedFields]
    : filterUntranslatedFields({ fields: extractedFields, targetDoc })
  const skippedFieldCount = extractedFields.length - pendingFields.length

  if (pendingFields.length === 0) {
    return {
      status: 'skipped',
      translatedFieldCount: 0,
      skippedFieldCount,
      characterCount: 0,
      message:
        '未入力の翻訳フィールドがありません。既存の翻訳を上書きする場合は「再翻訳（上書き）」を実行してください',
    }
  }

  const sourceUnits = pendingFields.flatMap((field) => field.texts)
  const characterCount = sourceUnits.reduce((sum, unit) => sum + unit.length, 0)

  const titleValue = Reflect.get(sourceDoc, 'title')
  const logBase = {
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    targetTitle: typeof titleValue === 'string' ? titleValue : request.targetSlug,
    executedBy: props.user.id,
    sourceLocale: sourceLocaleCode,
    targetLocale: targetLocaleCode,
    model: settings.model.value,
    characterCount,
    translatedFieldCount: pendingFields.length,
    skippedFieldCount,
  }

  const snapshot = await loadUsageSnapshot({
    payload: props.payload,
    userId: props.user.id,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    targetLocale: targetLocaleCode,
    now,
  })
  // 今回の実行費用の概算。日本語原文はほぼ 1文字=1トークン、出力も同規模とみなす保守的な見積もり
  const projectedCostUsd = estimateTranslationCost({
    model: settings.model,
    inputTokens: characterCount,
    outputTokens: characterCount,
  })
  const verdict = checkUsageLimits({
    snapshot,
    limits: settings.limits,
    requestedCharacterCount: characterCount,
    projectedCostUsd,
    now,
  })

  if (!verdict.allowed) {
    await createAiTranslationLog({
      payload: props.payload,
      entry: {
        ...logBase,
        status: 'rejected',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        errorMessage: verdict.reason,
      },
    })

    return new Error(verdict.reason)
  }

  // translateFn を DI している場合（テスト等）は実プロバイダを呼ばないため API キー不要
  const apiKey = process.env[settings.model.apiKeyEnvName] ?? ''

  if (!props.translateFn && apiKey === '') {
    const reason = `${settings.model.apiKeyEnvName} が設定されていません（.env / wrangler secret で設定してください）`

    await createAiTranslationLog({
      payload: props.payload,
      entry: {
        ...logBase,
        status: 'rejected',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        errorMessage: reason,
      },
    })

    return new Error(reason)
  }

  const translateFn = props.translateFn ?? resolveTranslateFn(settings.model.provider)
  const outcome = await translateFn({
    units: sourceUnits,
    sourceLocaleLabel,
    targetLocaleLabel,
    modelId: settings.model.modelId,
    apiKey,
    // モデルの出力上限を超える値を送ると API が 400 を返すため、レジストリの上限でクランプする
    maxOutputTokens: Math.min(characterCount * 4 + 1000, settings.model.maxOutputTokens),
  })

  if (outcome instanceof Error) {
    await createAiTranslationLog({
      payload: props.payload,
      entry: {
        ...logBase,
        status: 'failed',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        errorMessage: outcome.message,
      },
    })

    return new Error(`翻訳に失敗しました: ${outcome.message}`)
  }

  const estimatedCostUsd = estimateTranslationCost({
    model: settings.model,
    inputTokens: outcome.inputTokens,
    outputTokens: outcome.outputTokens,
  })
  const usageEntry = {
    inputTokens: outcome.inputTokens,
    outputTokens: outcome.outputTokens,
    estimatedCostUsd,
  }

  const guarded = guardTranslations({ sourceUnits, translations: outcome.translations })

  if (guarded instanceof Error) {
    await createAiTranslationLog({
      payload: props.payload,
      entry: { ...logBase, ...usageEntry, status: 'failed', errorMessage: guarded.message },
    })

    return guarded
  }

  // 楽観ロック: AI 呼び出し中（最大90秒）に翻訳先が編集されていたら、古いスナップショットで
  // 上書きしないよう保存を中止する
  const latestTargetDoc = await fetchTranslationDocument({
    payload: props.payload,
    user: props.user,
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    locale: targetLocaleCode,
  })
  const targetUpdatedAt = Reflect.get(targetDoc, 'updatedAt')
  const latestUpdatedAt =
    latestTargetDoc instanceof Error ? null : Reflect.get(latestTargetDoc, 'updatedAt')

  if (latestTargetDoc instanceof Error || targetUpdatedAt !== latestUpdatedAt) {
    const reason = '翻訳中にドキュメントが更新されたため保存を中止しました。再実行してください'

    await createAiTranslationLog({
      payload: props.payload,
      entry: { ...logBase, ...usageEntry, status: 'failed', errorMessage: reason },
    })

    return new Error(reason)
  }

  const updateData = applyTranslatedFields({
    baseDoc: targetDoc,
    sourceDoc,
    fields: pendingFields,
    translatedUnits: guarded,
  })

  if (updateData instanceof Error) {
    await createAiTranslationLog({
      payload: props.payload,
      entry: { ...logBase, ...usageEntry, status: 'failed', errorMessage: updateData.message },
    })

    return updateData
  }

  const saved = await updateTranslatedDocument({
    payload: props.payload,
    user: props.user,
    targetKind: request.targetKind,
    targetSlug: request.targetSlug,
    targetId: request.targetId,
    targetLocale: targetLocaleCode,
    updateData,
    hasDrafts: target.hasDrafts,
  })

  if (saved instanceof Error) {
    await createAiTranslationLog({
      payload: props.payload,
      entry: { ...logBase, ...usageEntry, status: 'failed', errorMessage: saved.message },
    })

    return saved
  }

  await createAiTranslationLog({
    payload: props.payload,
    entry: { ...logBase, ...usageEntry, status: 'succeeded', errorMessage: null },
  })

  return {
    status: 'succeeded',
    translatedFieldCount: pendingFields.length,
    skippedFieldCount,
    characterCount,
    message: `${pendingFields.length}項目を${targetLocaleLabel}へ翻訳しました。内容を確認してから公開してください`,
  }
}
