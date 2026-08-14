export type TranslationModel = {
  value: string
  label: string
  provider: "anthropic" | "openai"
  modelId: string
  apiKeyEnvName: string
  inputCostUsdPerMTok: number
  outputCostUsdPerMTok: number
  // モデルごとの最大出力トークン数。超える値を送ると API が 400 を返すため必ずクランプに使う
  maxOutputTokens: number
}

// 対応モデルはここに追加する（value は「provider/モデルID」形式）。
// 単価は 2026-07 時点の公表値ベースの参考値。実際の請求は各プロバイダのダッシュボードで確認する。
export const translationModels: ReadonlyArray<TranslationModel> = [
  {
    value: "anthropic/claude-haiku-4-5",
    label: "Claude Haiku 4.5（低コスト・推奨）",
    provider: "anthropic",
    modelId: "claude-haiku-4-5",
    apiKeyEnvName: "ANTHROPIC_API_KEY",
    inputCostUsdPerMTok: 1,
    outputCostUsdPerMTok: 5,
    maxOutputTokens: 32000,
  },
  {
    value: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5（高品質）",
    provider: "anthropic",
    modelId: "claude-sonnet-5",
    apiKeyEnvName: "ANTHROPIC_API_KEY",
    inputCostUsdPerMTok: 3,
    outputCostUsdPerMTok: 15,
    maxOutputTokens: 32000,
  },
  {
    value: "openai/gpt-4o-mini",
    label: "GPT-4o mini（低コスト）",
    provider: "openai",
    modelId: "gpt-4o-mini",
    apiKeyEnvName: "OPENAI_API_KEY",
    inputCostUsdPerMTok: 0.15,
    outputCostUsdPerMTok: 0.6,
    maxOutputTokens: 16384,
  },
  {
    value: "openai/gpt-4.1",
    label: "GPT-4.1（高品質）",
    provider: "openai",
    modelId: "gpt-4.1",
    apiKeyEnvName: "OPENAI_API_KEY",
    inputCostUsdPerMTok: 2,
    outputCostUsdPerMTok: 8,
    maxOutputTokens: 32768,
  },
]
