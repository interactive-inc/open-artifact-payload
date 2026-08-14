import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`ai_translation_logs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`target_kind\` text NOT NULL,
  	\`target_slug\` text NOT NULL,
  	\`target_id\` text,
  	\`target_title\` text,
  	\`executed_by_id\` integer,
  	\`source_locale\` text NOT NULL,
  	\`target_locale\` text NOT NULL,
  	\`model\` text NOT NULL,
  	\`status\` text NOT NULL,
  	\`character_count\` numeric,
  	\`input_tokens\` numeric,
  	\`output_tokens\` numeric,
  	\`estimated_cost_usd\` numeric,
  	\`translated_field_count\` numeric,
  	\`skipped_field_count\` numeric,
  	\`error_message\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`executed_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`ai_translation_logs_executed_by_idx\` ON \`ai_translation_logs\` (\`executed_by_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`ai_translation_logs_updated_at_idx\` ON \`ai_translation_logs\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`ai_translation_logs_created_at_idx\` ON \`ai_translation_logs\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`ai_translation_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT false,
  	\`model\` text DEFAULT 'anthropic/claude-haiku-4-5' NOT NULL,
  	\`limits_monthly_run_limit\` numeric DEFAULT 100 NOT NULL,
  	\`limits_monthly_character_limit\` numeric DEFAULT 300000 NOT NULL,
  	\`limits_monthly_cost_limit_usd\` numeric DEFAULT 10 NOT NULL,
  	\`limits_per_run_character_limit\` numeric DEFAULT 20000 NOT NULL,
  	\`limits_cooldown_seconds\` numeric DEFAULT 30 NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`DROP INDEX \`news_locales_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`news_meta_meta_image_idx\` ON \`news_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_news_v_locales_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_news_v_version_meta_version_meta_image_idx\` ON \`_news_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`works_locales_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`works_meta_meta_image_idx\` ON \`works_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_works_v_locales_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_works_v_version_meta_version_meta_image_idx\` ON \`_works_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`home_page_locales_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`home_page_meta_meta_image_idx\` ON \`home_page_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_home_page_v_locales_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_home_page_v_version_meta_version_meta_image_idx\` ON \`_home_page_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`ai_translation_logs_id\` integer REFERENCES ai_translation_logs(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_ai_translation_logs_id_idx\` ON \`payload_locked_documents_rels\` (\`ai_translation_logs_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`ai_translation_logs\`;`)
  await db.run(sql`DROP TABLE \`ai_translation_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`news_id\` integer,
  	\`faq_id\` integer,
  	\`contact_submissions_id\` integer,
  	\`works_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faq_id\`) REFERENCES \`faq\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "news_id", "faq_id", "contact_submissions_id", "works_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "news_id", "faq_id", "contact_submissions_id", "works_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_faq_id_idx\` ON \`payload_locked_documents_rels\` (\`faq_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`,
  )
  await db.run(sql`DROP INDEX \`news_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`news_locales_meta_meta_image_idx\` ON \`news_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_news_v_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_news_v_locales_version_meta_version_meta_image_idx\` ON \`_news_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`works_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`works_locales_meta_meta_image_idx\` ON \`works_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_works_v_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_works_v_locales_version_meta_version_meta_image_idx\` ON \`_works_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`home_page_meta_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`home_page_locales_meta_meta_image_idx\` ON \`home_page_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(sql`DROP INDEX \`_home_page_v_version_meta_version_meta_image_idx\`;`)
  await db.run(
    sql`CREATE INDEX \`_home_page_v_locales_version_meta_version_meta_image_idx\` ON \`_home_page_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
}
