import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`contact_submissions\` ADD \`notification_status\` text DEFAULT 'pending';`,
  )
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`notification_error\` text;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`notified_at\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`notification_status\`;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`notification_error\`;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`notified_at\`;`)
}
