export type TranslatableField = {
  path: ReadonlyArray<string | number>
  kind: 'plain' | 'lexical'
  texts: ReadonlyArray<string>
}

export type TranslateRequest = {
  units: ReadonlyArray<string>
  sourceLocaleLabel: string
  targetLocaleLabel: string
  modelId: string
  apiKey: string
  maxOutputTokens: number
}

export type TranslateSuccess = {
  translations: ReadonlyArray<string>
  inputTokens: number
  outputTokens: number
}

// API は応答した（= 課金された）が応答内容が不正だったケース。実トークンを監査ログへ残すため
// Error ではなく使用量付きで返す。通信エラーなど課金が確定しないケースは従来どおり Error。
export type TranslateFailure = {
  failureMessage: string
  inputTokens: number
  outputTokens: number
}

export type TranslateFn = (
  request: TranslateRequest,
) => Promise<TranslateSuccess | TranslateFailure | Error>

export type UsageSnapshot = {
  monthlyRunCount: number
  monthlyCharacterCount: number
  monthlyCostUsd: number
  lastRunAt: Date | null
}

export type UsageLimits = {
  monthlyRunLimit: number
  monthlyCharacterLimit: number
  monthlyCostLimitUsd: number
  perRunCharacterLimit: number
  cooldownSeconds: number
}
