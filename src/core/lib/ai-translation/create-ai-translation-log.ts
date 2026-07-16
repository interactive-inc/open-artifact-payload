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
  status: 'pending' | 'succeeded' | 'failed' | 'rejected'
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
 * AI翻訳の監査ログを保存し、作成したログの id を返す（アクセス制御はサーバー内部作成のため override）。
 * pending の予約行としても使う: AI 呼び出し前に作成しておくことで、並行リクエストが互いの実行を
 * 上限・クールダウン集計で見られるようにする。
 * ログ保存自体の失敗で翻訳処理を壊さないよう、例外は握って null を返す。
 */
export async function createAiTranslationLog(props: Props): Promise<number | null> {
  try {
    const created = await props.payload.create({
      collection: 'ai-translation-logs',
      data: props.entry,
    })

    return created.id
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    props.payload.logger.error(`AI翻訳ログの保存に失敗しました: ${message}`)

    return null
  }
}
