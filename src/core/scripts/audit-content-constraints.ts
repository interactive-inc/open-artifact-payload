import "dotenv/config"
import { getPayload, type Payload } from "payload"
import config from "@payload-config"

import { collectConstraintViolations } from "@/core/lib/validation/collect-constraint-violations"
import {
  COLLECTION_CONSTRAINT_RULES,
  GLOBAL_CONSTRAINT_RULES,
} from "@/core/lib/validation/content-constraint-rules"
import { isRegisteredCollectionSlug } from "@/core/lib/validation/is-registered-collection-slug"
import { isRegisteredGlobalSlug } from "@/core/lib/validation/is-registered-global-slug"
import { locales } from "@/project/shared/lib/locale-types"

async function auditCollections(payload: Payload): Promise<string[]> {
  const rows: string[] = []

  for (const slug of Object.keys(COLLECTION_CONSTRAINT_RULES)) {
    if (!isRegisteredCollectionSlug(slug, payload)) continue

    const rules = COLLECTION_CONSTRAINT_RULES[slug] ?? []

    for (const locale of locales) {
      const found = await payload.find({
        collection: slug,
        locale,
        // fallback を切って、その locale に実際に入力されている値だけを対象にする。
        fallbackLocale: false,
        depth: 0,
        draft: true,
        pagination: false,
        overrideAccess: true,
      })

      for (const document of found.docs) {
        for (const violation of collectConstraintViolations({ source: document, rules })) {
          rows.push(`${slug}, ${document.id}, ${locale}, ${violation.field}, ${violation.reason}`)
        }
      }
    }
  }

  return rows
}

async function auditGlobals(payload: Payload): Promise<string[]> {
  const rows: string[] = []

  for (const slug of Object.keys(GLOBAL_CONSTRAINT_RULES)) {
    if (!isRegisteredGlobalSlug(slug, payload)) continue

    const rules = GLOBAL_CONSTRAINT_RULES[slug] ?? []

    for (const locale of locales) {
      const document = await payload.findGlobal({
        slug,
        locale,
        fallbackLocale: false,
        depth: 0,
        draft: true,
        overrideAccess: true,
      })

      for (const violation of collectConstraintViolations({ source: document, rules })) {
        rows.push(`${slug}, -, ${locale}, ${violation.field}, ${violation.reason}`)
      }
    }
  }

  return rows
}

/**
 * 保存済みコンテンツへ現在の入力制約を当てて、違反している値を一覧する読み取り専用スクリプト。
 * 制約を後から追加した案件が、管理画面で直すべき箇所を把握するために使う。
 */
async function main(): Promise<void> {
  const payload = await getPayload({ config: await config })
  const collectionRows = await auditCollections(payload)
  const globalRows = await auditGlobals(payload)
  const rows = [...collectionRows, ...globalRows]

  if (rows.length === 0) {
    console.log("制約違反は見つかりませんでした")
    process.exit(0)
  }

  console.log("collection/global, id, locale, field, reason")

  for (const row of rows) console.log(row)

  console.error(`${rows.length} 件の制約違反があります。管理画面で修正してください`)
  process.exit(1)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
