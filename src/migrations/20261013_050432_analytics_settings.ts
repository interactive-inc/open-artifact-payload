import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`analytics_settings_viewer_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`analytics_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`analytics_settings_viewer_roles_order_idx\` ON \`analytics_settings_viewer_roles\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`analytics_settings_viewer_roles_parent_idx\` ON \`analytics_settings_viewer_roles\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`analytics_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`property_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`analytics_settings_viewer_roles\`;`)
  await db.run(sql`DROP TABLE \`analytics_settings\`;`)
}
