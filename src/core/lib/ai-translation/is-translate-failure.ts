import type {
  TranslateFailure,
  TranslateSuccess,
} from '@/core/lib/ai-translation/translation-types'

/**
 * TranslateFn の戻り値が「課金済みだが内容不正」の失敗かどうかの型ガード。
 */
export function isTranslateFailure(
  outcome: TranslateSuccess | TranslateFailure,
): outcome is TranslateFailure {
  return 'failureMessage' in outcome
}
