import type { Payload } from 'payload'

type LogEntry = {
  targetKind: 'collection' | 'global'
  targetSlug: string
  targetId: string | null
  targetTitle: string | null
  executedBy: number
  sourceLocale: string
  targetLocale: string
  model: string
  status: 'succeeded' | 'failed' | 'rejected'
  characterCount: number
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
  translatedFieldCount: number
  skippedFieldCount: number
  errorMessage: string | null
}

type Props = {
  payload: Payload
  entry: LogEntry
}

/**
 * AI翻訳の監査ログを保存する（アクセス制御はサーバー内部作成のため override）。
 * ログ保存自体の失敗で翻訳処理を壊さないよう、例外は握ってロガーに流すだけにする。
 */
export async function createAiTranslationLog(props: Props): Promise<void> {
  try {
    await props.payload.create({
      collection: 'ai-translation-logs',
      data: props.entry,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    props.payload.logger.error(`AI翻訳ログの保存に失敗しました: ${message}`)
  }
}
