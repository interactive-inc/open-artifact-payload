import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`media_delete\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`news_delete\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`faq_delete\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`works_delete\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`media_delete\` integer DEFAULT false;`,
  )
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`news_delete\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`faq_delete\` integer DEFAULT false;`)
  await db.run(
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`works_delete\` integer DEFAULT false;`,
  )
}
