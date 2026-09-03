import { readFile } from "node:fs/promises"
import path from "node:path"

import { parse } from "jsonc-parser"
import { describe, expect, it } from "vite-plus/test"

import { getCloudflareConfigIssues, updateCloudflareConfig } from "@/core/scripts/cloudflare-config"

const accountId = "0123456789abcdef0123456789abcdef"
const databaseId = "12345678-1234-4234-8234-123456789abc"

describe("Cloudflare config", () => {
  it("実際の雛形を案件固有のローカル・本番リソースへ安全に更新する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const result = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(result)

    expect(config.name).toBe("sakura-trip-local")
    expect(config.account_id).toBe(accountId)
    expect(config.d1_databases[0]).toMatchObject({
      binding: "D1",
      database_name: "sakura-trip-local-cms",
      remote: false,
    })
    expect(config.d1_databases[0]).not.toHaveProperty("database_id")
    expect(config.r2_buckets[0]).toMatchObject({
      binding: "R2",
      bucket_name: "sakura-trip-local-cms",
      remote: false,
    })
    expect(config.env.production).toMatchObject({
      name: "sakura-trip",
      account_id: accountId,
      d1_databases: [
        {
          binding: "D1",
          database_id: databaseId,
          database_name: "sakura-trip-cms",
          remote: true,
        },
      ],
      r2_buckets: [{ binding: "R2", bucket_name: "sakura-trip-cms", remote: true }],
    })
    expect(result).toContain("// Enable Node.js API")
    expect(getCloudflareConfigIssues({ source: result, environment: "production" })).toEqual([])
  })

  it("staging も案件固有の Worker / D1 / R2 名へ更新する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const result = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(result)

    expect(config.env.staging).toMatchObject({
      name: "sakura-trip-staging",
      account_id: accountId,
      d1_databases: [
        {
          binding: "D1",
          database_id: "<D1_DATABASE_ID>",
          database_name: "sakura-trip-staging-cms",
          remote: true,
        },
      ],
      r2_buckets: [{ binding: "R2", bucket_name: "sakura-trip-staging-cms", remote: true }],
    })
    expect(getCloudflareConfigIssues({ source: result, environment: "staging" })).toContain(
      "env.staging の D1 database_id が雛形のままです",
    )
  })

  it("staging の database_id を設定すれば staging も検査を通過する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const configured = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(configured)
    config.env.staging.d1_databases[0].database_id = "abcdef01-1234-4234-8234-123456789abc"

    expect(
      getCloudflareConfigIssues({ source: JSON.stringify(config), environment: "staging" }),
    ).toEqual([])
  })

  it("staging と production が同じ D1 / R2 を指していたら拒否する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const configured = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(configured)
    config.env.staging.d1_databases[0].database_id = databaseId
    config.env.staging.d1_databases[0].database_name = "sakura-trip-cms"
    config.env.staging.r2_buckets[0].bucket_name = "sakura-trip-cms"

    const issues = getCloudflareConfigIssues({
      source: JSON.stringify(config),
      environment: "production",
    })

    expect(issues).toContain("env.staging と D1 database_id が重複しています")
    expect(issues).toContain("env.staging と D1 database_name が重複しています")
    expect(issues).toContain("env.staging と R2 bucket_name が重複しています")
  })

  it("ローカルとデプロイ環境が同じ D1 / R2 を指していたら拒否する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const configured = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(configured)
    config.d1_databases[0].database_name = "sakura-trip-cms"
    config.r2_buckets[0].bucket_name = "sakura-trip-cms"

    const issues = getCloudflareConfigIssues({
      source: JSON.stringify(config),
      environment: "production",
    })

    expect(issues).toContain("ローカル用とデプロイ用の D1 名が同一です")
    expect(issues).toContain("ローカル用とデプロイ用の R2 bucket_name が同一です")
  })

  it("D1を自動作成しない場合は既存の本番database_idをプレースホルダーへ戻す", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const withLegacyId = source.replace("<D1_DATABASE_ID>", "eabbe0ed-1d16-48de-b5cf-728e23a91a42")
    const result = updateCloudflareConfig({
      source: withLegacyId,
      projectSlug: "sakura-trip",
      accountId,
    })
    const config = parse(result)

    expect(config.env.production.d1_databases[0].database_id).toBe("<D1_DATABASE_ID>")
    expect(getCloudflareConfigIssues({ source: result, environment: "production" })).toContain(
      "env.production の D1 database_id が雛形のままです",
    )
  })

  it("雛形値や環境間で共有された本番リソースを拒否する", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const configured = updateCloudflareConfig({
      source,
      projectSlug: "sakura-trip",
      accountId,
      productionDatabaseId: databaseId,
    })
    const config = parse(configured)
    config.env.staging = structuredClone(config.env.production)

    const issues = getCloudflareConfigIssues({
      source: JSON.stringify(config),
      environment: "production",
      accountIdFromEnvironment: "f".repeat(32),
    })

    expect(issues).toContain("CLOUDFLARE_ACCOUNT_ID と wrangler.jsonc の account_id が一致しません")
    expect(issues).toContain("env.staging と Worker 名が重複しています")
    expect(issues).toContain("env.staging と D1 database_id が重複しています")
    expect(issues).toContain("env.staging と R2 bucket_name が重複しています")
  })

  it("未設定の雛形はデプロイ可能と判定しない", async () => {
    const source = await readFile(path.resolve("wrangler.jsonc"), "utf8")
    const issues = getCloudflareConfigIssues({ source, environment: "production" })

    expect(issues).toContain("env.production.name が雛形のままです")
    expect(getCloudflareConfigIssues({ source, environment: "staging" })).toContain(
      "env.staging.name が雛形のままです",
    )
    expect(issues).toContain(
      "env.production.account_id または CLOUDFLARE_ACCOUNT_ID に有効な Account ID を設定してください",
    )
    expect(issues).toContain("env.production の D1 database_id に有効なUUIDを設定してください")
  })
})
