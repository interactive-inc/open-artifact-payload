import { describe, expect, it } from "vite-plus/test"

import { evaluateCloudflareSecrets } from "@/core/scripts/evaluate-cloudflare-secrets"

const allSecretNames = [
  "PAYLOAD_SECRET",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "CONTACT_NOTIFICATION_EMAIL",
  "CONTACT_NOTIFICATION_FROM",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
]

describe("evaluateCloudflareSecrets", () => {
  it("必須も任意もすべて登録済みなら不足を返さない", () => {
    const evaluation = evaluateCloudflareSecrets({ registeredNames: allSecretNames })

    expect(evaluation.missingRequired).toEqual([])
    expect(evaluation.missingOptional).toEqual([])
  })

  it("何も登録されていなければ PAYLOAD_SECRET を必須不足として返す", () => {
    const evaluation = evaluateCloudflareSecrets({ registeredNames: [] })

    expect(evaluation.missingRequired).toEqual(["PAYLOAD_SECRET"])
    expect(evaluation.missingOptional).toEqual([
      "TURNSTILE_SECRET_KEY",
      "RESEND_API_KEY",
      "CONTACT_NOTIFICATION_EMAIL",
      "CONTACT_NOTIFICATION_FROM",
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
    ])
  })

  it("必須だけ登録済みなら任意の不足のみ返す", () => {
    const evaluation = evaluateCloudflareSecrets({ registeredNames: ["PAYLOAD_SECRET"] })

    expect(evaluation.missingRequired).toEqual([])
    expect(evaluation.missingOptional).toContain("TURNSTILE_SECRET_KEY")
  })

  it("登録済み名の前後の空白を無視する", () => {
    const evaluation = evaluateCloudflareSecrets({ registeredNames: [" PAYLOAD_SECRET "] })

    expect(evaluation.missingRequired).toEqual([])
  })

  it("関係のない secret 名は不足判定に影響しない", () => {
    const evaluation = evaluateCloudflareSecrets({
      registeredNames: ["PAYLOAD_SECRET", "UNRELATED_SECRET"],
    })

    expect(evaluation.missingRequired).toEqual([])
    expect(evaluation.missingOptional).not.toContain("UNRELATED_SECRET")
  })
})
