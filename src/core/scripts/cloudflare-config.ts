import { applyEdits, modify, parse, type ParseError, printParseErrorCode } from "jsonc-parser"

import { assertSlug } from "@/core/scripts/slug"

const ACCOUNT_ID_PATTERN = /^[0-9a-f]{32}$/i
const DATABASE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const WORKER_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

const D1_BINDING = "D1"
const R2_BINDING = "R2"
const TEMPLATE_WORKER_NAME = "open-artifact-payload"
const DATABASE_ID_PLACEHOLDER = "<D1_DATABASE_ID>"
const LEGACY_TEMPLATE_DATABASE_ID = "eabbe0ed-1d16-48de-b5cf-728e23a91a42"
const EMPTY_DATABASE_ID = "00000000-0000-0000-0000-000000000000"
const STAGING_ENVIRONMENT = "staging"
const STAGING_WORKER_SUFFIX = "-staging"

type JsonObject = Record<string, unknown>

type UpdateCloudflareConfigProps = {
  source: string
  projectSlug: string
  accountId: string
  productionDatabaseId?: string
}

type ValidateCloudflareConfigProps = {
  source: string
  environment: string
  accountIdFromEnvironment?: string
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseConfig(source: string): JsonObject {
  const errors: ParseError[] = []
  const config: unknown = parse(source, errors, { allowTrailingComma: true })

  if (errors.length > 0) {
    const details = errors
      .map((error) => `${printParseErrorCode(error.error)} (offset: ${error.offset})`)
      .join(", ")
    throw new Error(`wrangler.jsonc を解析できません: ${details}`)
  }
  if (!isObject(config)) {
    throw new Error("wrangler.jsonc のルートはオブジェクトである必要があります")
  }
  return config
}

function getObject(value: unknown, label: string): JsonObject {
  if (!isObject(value)) {
    throw new Error(`${label} が見つからないか、オブジェクトではありません`)
  }
  return value
}

function getBindingIndex(
  config: JsonObject,
  key: "d1_databases" | "r2_buckets",
  binding: string,
): number {
  const bindings = config[key]
  if (!Array.isArray(bindings)) {
    throw new Error(`${key} が配列ではありません`)
  }

  const matches = bindings.flatMap((item, index) =>
    isObject(item) && item.binding === binding ? [index] : [],
  )
  if (matches.length !== 1) {
    throw new Error(`${key} の ${binding} binding は1件だけ定義してください`)
  }
  return matches[0]
}

function setJsoncValue(source: string, path: (string | number)[], value: unknown): string {
  return applyEdits(
    source,
    modify(source, path, value, {
      formattingOptions: { insertSpaces: true, tabSize: 2 },
    }),
  )
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function getBinding(
  config: JsonObject,
  key: "d1_databases" | "r2_buckets",
  binding: string,
): JsonObject | undefined {
  const bindings = config[key]
  if (!Array.isArray(bindings)) return undefined
  const matches = bindings.filter((item) => isObject(item) && item.binding === binding)
  return matches.length === 1 && isObject(matches[0]) ? matches[0] : undefined
}

function isTemplateWorkerName(value: string): boolean {
  if (value === TEMPLATE_WORKER_NAME) return true

  return value.startsWith(`${TEMPLATE_WORKER_NAME}-`)
}

/**
 * 環境間の重複判定に使える database_id を返す。
 *
 * 雛形のプレースホルダーは全環境で同じ値になるため、重複ではなく未設定として扱う。
 */
function getComparableDatabaseId(binding: JsonObject | undefined): string | undefined {
  if (!binding) return undefined

  const databaseId = stringValue(binding.database_id)
  if (!databaseId) return undefined
  if (databaseId === DATABASE_ID_PLACEHOLDER) return undefined
  if (databaseId === LEGACY_TEMPLATE_DATABASE_ID) return undefined
  if (databaseId === EMPTY_DATABASE_ID) return undefined

  return databaseId
}

export function assertCloudflareAccountId(value: string): void {
  if (!ACCOUNT_ID_PATTERN.test(value)) {
    throw new Error("Cloudflare Account ID は32桁の16進数で入力してください")
  }
}

export function assertCloudflareDatabaseId(value: string): void {
  if (!DATABASE_ID_PATTERN.test(value)) {
    throw new Error("Cloudflare D1 database_id はUUID形式で入力してください")
  }
}

type ConfigChange = { path: (string | number)[]; value: unknown }

type EnvironmentChangeProps = {
  environments: JsonObject
  environment: string
  workerName: string
  accountId: string
  databaseId: string
}

/**
 * デプロイ環境 1 つ分の書き換え内容を組み立てる。
 *
 * 定義されていない環境 (staging を削除した案件など) は書き換え対象から外す。
 */
function buildEnvironmentChanges(props: EnvironmentChangeProps): ConfigChange[] {
  const target = props.environments[props.environment]
  if (!isObject(target)) return []

  const d1Index = getBindingIndex(target, "d1_databases", D1_BINDING)
  const r2Index = getBindingIndex(target, "r2_buckets", R2_BINDING)
  const resourceName = `${props.workerName}-cms`
  const d1Path = ["env", props.environment, "d1_databases", d1Index]
  const r2Path = ["env", props.environment, "r2_buckets", r2Index]

  return [
    { path: ["env", props.environment, "name"], value: props.workerName },
    { path: ["env", props.environment, "account_id"], value: props.accountId },
    { path: [...d1Path, "database_id"], value: props.databaseId },
    { path: [...d1Path, "database_name"], value: resourceName },
    { path: [...d1Path, "remote"], value: true },
    { path: [...r2Path, "bucket_name"], value: resourceName },
    { path: [...r2Path, "remote"], value: true },
  ]
}

export function updateCloudflareConfig(props: UpdateCloudflareConfigProps): string {
  assertSlug(props.projectSlug)
  assertCloudflareAccountId(props.accountId)
  if (props.productionDatabaseId) assertCloudflareDatabaseId(props.productionDatabaseId)

  const initialConfig = parseConfig(props.source)
  const environments = getObject(initialConfig.env, "env")
  // production は必須。staging は削除している案件があるため、存在するときだけ書き換える
  getObject(environments.production, "env.production")
  const localD1Index = getBindingIndex(initialConfig, "d1_databases", D1_BINDING)
  const localR2Index = getBindingIndex(initialConfig, "r2_buckets", R2_BINDING)

  const localWorkerName = `${props.projectSlug}-local`
  const localResourceName = `${localWorkerName}-cms`
  const stagingWorkerName = `${props.projectSlug}${STAGING_WORKER_SUFFIX}`

  const localChanges: ConfigChange[] = [
    { path: ["name"], value: localWorkerName },
    { path: ["account_id"], value: props.accountId },
    { path: ["d1_databases", localD1Index, "database_id"], value: undefined },
    { path: ["d1_databases", localD1Index, "database_name"], value: localResourceName },
    { path: ["d1_databases", localD1Index, "remote"], value: false },
    { path: ["r2_buckets", localR2Index, "bucket_name"], value: localResourceName },
    { path: ["r2_buckets", localR2Index, "remote"], value: false },
  ]

  // staging の D1 は setup では作成しないため、常にプレースホルダーへ戻して preflight で止める
  const changes: ConfigChange[] = [
    ...localChanges,
    ...buildEnvironmentChanges({
      environments,
      environment: "production",
      workerName: props.projectSlug,
      accountId: props.accountId,
      databaseId: props.productionDatabaseId ?? DATABASE_ID_PLACEHOLDER,
    }),
    ...buildEnvironmentChanges({
      environments,
      environment: STAGING_ENVIRONMENT,
      workerName: stagingWorkerName,
      accountId: props.accountId,
      databaseId: DATABASE_ID_PLACEHOLDER,
    }),
  ]

  return changes.reduce(
    (source, change) => setJsoncValue(source, change.path, change.value),
    props.source,
  )
}

export function getCloudflareConfigIssues(props: ValidateCloudflareConfigProps): string[] {
  let config: JsonObject
  try {
    config = parseConfig(props.source)
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)]
  }

  const issues: string[] = []
  const environments = isObject(config.env) ? config.env : undefined
  const targetValue = environments?.[props.environment]
  if (!isObject(targetValue)) {
    return [`env.${props.environment} が定義されていません`]
  }
  const target: JsonObject = targetValue

  const localName = stringValue(config.name)
  const targetName = stringValue(target.name)
  if (!targetName || !WORKER_NAME_PATTERN.test(targetName)) {
    issues.push(`env.${props.environment}.name に有効な Worker 名を設定してください`)
  }
  if (targetName && isTemplateWorkerName(targetName)) {
    issues.push(`env.${props.environment}.name が雛形のままです`)
  }
  if (localName && targetName === localName) {
    issues.push("ローカル用とデプロイ用の Worker 名が同一です")
  }

  const rootAccountId = stringValue(config.account_id)
  const targetAccountId = stringValue(target.account_id)
  const effectiveAccountId = targetAccountId ?? rootAccountId ?? props.accountIdFromEnvironment
  if (!effectiveAccountId || !ACCOUNT_ID_PATTERN.test(effectiveAccountId)) {
    issues.push(
      `env.${props.environment}.account_id または CLOUDFLARE_ACCOUNT_ID に有効な Account ID を設定してください`,
    )
  }
  if (effectiveAccountId === "0".repeat(32)) {
    issues.push("Cloudflare Account ID がプレースホルダーのままです")
  }
  if (rootAccountId && targetAccountId && rootAccountId !== targetAccountId) {
    issues.push("トップレベルとデプロイ環境の account_id が一致しません")
  }
  if (
    props.accountIdFromEnvironment &&
    effectiveAccountId &&
    props.accountIdFromEnvironment !== effectiveAccountId
  ) {
    issues.push("CLOUDFLARE_ACCOUNT_ID と wrangler.jsonc の account_id が一致しません")
  }

  const localD1 = getBinding(config, "d1_databases", D1_BINDING)
  const targetD1 = getBinding(target, "d1_databases", D1_BINDING)
  if (!localD1) {
    issues.push("トップレベルの D1 binding を1件だけ定義してください")
  } else {
    if (localD1.remote !== false) issues.push("トップレベルの D1 は remote: false にしてください")
    if (stringValue(localD1.database_id)) {
      issues.push("ローカル用 D1 に database_id を設定しないでください")
    }
    if (localName && localD1.database_name !== `${localName}-cms`) {
      issues.push("ローカル用 D1 名が Worker 名と一致しません")
    }
  }
  if (!targetD1) {
    issues.push(`env.${props.environment} の D1 binding を1件だけ定義してください`)
  } else {
    const databaseId = stringValue(targetD1.database_id)
    if (!databaseId || !DATABASE_ID_PATTERN.test(databaseId)) {
      issues.push(`env.${props.environment} の D1 database_id に有効なUUIDを設定してください`)
    }
    if (
      databaseId === DATABASE_ID_PLACEHOLDER ||
      databaseId === LEGACY_TEMPLATE_DATABASE_ID ||
      databaseId === EMPTY_DATABASE_ID
    ) {
      issues.push(`env.${props.environment} の D1 database_id が雛形のままです`)
    }
    if (targetName && targetD1.database_name !== `${targetName}-cms`) {
      issues.push(`env.${props.environment} の D1名が Worker名と一致しません`)
    }
    if (targetD1.remote !== true) {
      issues.push(`env.${props.environment} の D1 は remote: true にしてください`)
    }
  }

  const localR2 = getBinding(config, "r2_buckets", R2_BINDING)
  const targetR2 = getBinding(target, "r2_buckets", R2_BINDING)
  if (!localR2) {
    issues.push("トップレベルの R2 binding を1件だけ定義してください")
  } else {
    if (localR2.remote !== false) issues.push("トップレベルの R2 は remote: false にしてください")
    if (localName && localR2.bucket_name !== `${localName}-cms`) {
      issues.push("ローカル用 R2名が Worker名と一致しません")
    }
  }
  if (!targetR2) {
    issues.push(`env.${props.environment} の R2 binding を1件だけ定義してください`)
  } else {
    if (targetName && targetR2.bucket_name !== `${targetName}-cms`) {
      issues.push(`env.${props.environment} の R2名が Worker名と一致しません`)
    }
    if (targetR2.remote !== true) {
      issues.push(`env.${props.environment} の R2 は remote: true にしてください`)
    }
  }

  // ローカル (トップレベル) と検査対象が同じ D1 / R2 を指していないか確認する
  const targetDatabaseName = targetD1 && stringValue(targetD1.database_name)
  const targetBucketName = targetR2 && stringValue(targetR2.bucket_name)
  const localDatabaseName = localD1 && stringValue(localD1.database_name)
  const localBucketName = localR2 && stringValue(localR2.bucket_name)
  if (targetDatabaseName && localDatabaseName === targetDatabaseName) {
    issues.push("ローカル用とデプロイ用の D1 名が同一です")
  }
  if (targetBucketName && localBucketName === targetBucketName) {
    issues.push("ローカル用とデプロイ用の R2 bucket_name が同一です")
  }

  // 他のデプロイ環境 (staging / production など) とリソースを共有していないか確認する
  const targetDatabaseId = getComparableDatabaseId(targetD1)
  for (const name of Object.keys(environments ?? {})) {
    if (name === props.environment) continue

    const sibling = environments?.[name]
    if (!isObject(sibling)) continue

    const siblingD1 = getBinding(sibling, "d1_databases", D1_BINDING)
    const siblingR2 = getBinding(sibling, "r2_buckets", R2_BINDING)
    if (targetName && stringValue(sibling.name) === targetName) {
      issues.push(`env.${name} と Worker 名が重複しています`)
    }
    if (targetDatabaseId && getComparableDatabaseId(siblingD1) === targetDatabaseId) {
      issues.push(`env.${name} と D1 database_id が重複しています`)
    }
    if (
      targetDatabaseName &&
      siblingD1 &&
      stringValue(siblingD1.database_name) === targetDatabaseName
    ) {
      issues.push(`env.${name} と D1 database_name が重複しています`)
    }
    if (targetBucketName && siblingR2 && stringValue(siblingR2.bucket_name) === targetBucketName) {
      issues.push(`env.${name} と R2 bucket_name が重複しています`)
    }
  }

  return issues
}
