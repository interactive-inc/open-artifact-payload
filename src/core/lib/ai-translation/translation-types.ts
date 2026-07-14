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

export type TranslateFn = (request: TranslateRequest) => Promise<TranslateSuccess | Error>

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
