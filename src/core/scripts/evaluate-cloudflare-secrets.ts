const REQUIRED_SECRET_NAMES: ReadonlyArray<string> = ["PAYLOAD_SECRET"]

const OPTIONAL_SECRET_NAMES: ReadonlyArray<string> = [
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "CONTACT_NOTIFICATION_EMAIL",
  "CONTACT_NOTIFICATION_FROM",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
]

type Props = {
  registeredNames: ReadonlyArray<string>
}

type CloudflareSecretsEvaluation = {
  missingRequired: string[]
  missingOptional: string[]
}

/**
 * 登録済み secret 名の一覧から、未登録の必須 secret と任意 secret を切り分ける。
 *
 * 値そのものは受け取らない。デプロイ前の検査で secret の中身をログへ流さないため。
 */
export function evaluateCloudflareSecrets(props: Props): CloudflareSecretsEvaluation {
  const registeredNames = new Set(props.registeredNames.map((name) => name.trim()))

  return {
    missingRequired: REQUIRED_SECRET_NAMES.filter((name) => !registeredNames.has(name)),
    missingOptional: OPTIONAL_SECRET_NAMES.filter((name) => !registeredNames.has(name)),
  }
}
