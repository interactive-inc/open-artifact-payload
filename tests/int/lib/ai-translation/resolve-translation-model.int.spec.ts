import { describe, expect, it } from "vite-plus/test"

import { resolveTranslationModel } from "@/core/lib/ai-translation/resolve-translation-model"
import { translationModels } from "@/core/lib/ai-translation/translation-models"

describe("resolveTranslationModel", () => {
  it("登録済みモデルを value で解決できる", () => {
    const model = resolveTranslationModel("anthropic/claude-haiku-4-5")

    if (model instanceof Error) throw model

    expect(model.provider).toBe("anthropic")
    expect(model.modelId).toBe("claude-haiku-4-5")
    expect(model.apiKeyEnvName).toBe("ANTHROPIC_API_KEY")
  })

  it("openai 系モデルは OPENAI_API_KEY を要求する", () => {
    const model = resolveTranslationModel("openai/gpt-4o-mini")

    if (model instanceof Error) throw model

    expect(model.provider).toBe("openai")
    expect(model.apiKeyEnvName).toBe("OPENAI_API_KEY")
  })

  it("未知のモデルは Error を返す", () => {
    const model = resolveTranslationModel("openai/gpt-999")

    expect(model).toBeInstanceOf(Error)
  })

  it("null / undefined も Error を返す", () => {
    expect(resolveTranslationModel(null)).toBeInstanceOf(Error)
    expect(resolveTranslationModel(undefined)).toBeInstanceOf(Error)
  })

  it("レジストリの全モデルに正の単価が設定されている", () => {
    for (const model of translationModels) {
      expect(model.inputCostUsdPerMTok).toBeGreaterThan(0)
      expect(model.outputCostUsdPerMTok).toBeGreaterThan(0)
    }
  })
})
