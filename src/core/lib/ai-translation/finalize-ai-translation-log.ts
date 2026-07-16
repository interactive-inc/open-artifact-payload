import type { Payload } from 'payload'

type Props = {
  payload: Payload
  logId: number
  status: 'succeeded' | 'failed' | 'rejected'
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
  translatedFieldCount: number
  errorMessage: string | null
}

/**
 * pending で予約した監査ログを最終結果で確定する。
 * ログ更新自体の失敗で翻訳処理を壊さないよう、例外は握ってロガーに流すだけにする。
 */
export async function finalizeAiTranslationLog(props: Props): Promise<void> {
  try {
    await props.payload.update({
      collection: 'ai-translation-logs',
      id: props.logId,
      data: {
        status: props.status,
        inputTokens: props.inputTokens,
        outputTokens: props.outputTokens,
        estimatedCostUsd: props.estimatedCostUsd,
        translatedFieldCount: props.translatedFieldCount,
        errorMessage: props.errorMessage,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    props.payload.logger.error(`AI翻訳ログの確定に失敗しました: ${message}`)
  }
}
