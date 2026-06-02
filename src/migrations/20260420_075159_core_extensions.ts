import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings_header_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`site_settings_header_nav_order_idx\` ON \`site_settings_header_nav\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_header_nav_parent_id_idx\` ON \`site_settings_header_nav\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`site_settings_footer_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`site_settings_footer_nav_order_idx\` ON \`site_settings_footer_nav\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_footer_nav_parent_id_idx\` ON \`site_settings_footer_nav\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`site_settings_policy_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`site_settings_policy_links_order_idx\` ON \`site_settings_policy_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_policy_links_parent_id_idx\` ON \`site_settings_policy_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`company_name\` text;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`inquiry_type\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`company_info_address\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`company_info_tel\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`company_info_fax\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings_header_nav\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_nav\`;`)
  await db.run(sql`DROP TABLE \`site_settings_policy_links\`;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`company_name\`;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`inquiry_type\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`company_info_address\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`company_info_tel\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`company_info_fax\`;`)
}
