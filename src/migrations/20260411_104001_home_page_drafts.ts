import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`_home_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_enabled\` integer DEFAULT true,
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_cta_label\` text,
  	\`version_hero_cta_href\` text,
  	\`version_featured_news_enabled\` integer DEFAULT true,
  	\`version_featured_news_heading\` text,
  	\`version_cta_enabled\` integer DEFAULT false,
  	\`version_cta_heading\` text,
  	\`version_cta_description\` text,
  	\`version_cta_cta_label\` text,
  	\`version_cta_cta_href\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_image_idx\` ON \`_home_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_autosave_idx\` ON \`_home_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`news_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_order_idx\` ON \`_home_page_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_parent_idx\` ON \`_home_page_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_path_idx\` ON \`_home_page_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_news_id_idx\` ON \`_home_page_v_rels\` (\`news_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_enabled\` integer DEFAULT true,
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`hero_image_id\` integer,
  	\`hero_cta_label\` text,
  	\`hero_cta_href\` text,
  	\`featured_news_enabled\` integer DEFAULT true,
  	\`featured_news_heading\` text,
  	\`cta_enabled\` integer DEFAULT false,
  	\`cta_heading\` text,
  	\`cta_description\` text,
  	\`cta_cta_label\` text,
  	\`cta_cta_href\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "_status", "updated_at", "created_at") SELECT "id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", 'published', "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_enabled\` integer DEFAULT true,
  	\`hero_title\` text NOT NULL,
  	\`hero_subtitle\` text,
  	\`hero_image_id\` integer,
  	\`hero_cta_label\` text,
  	\`hero_cta_href\` text,
  	\`featured_news_enabled\` integer DEFAULT true,
  	\`featured_news_heading\` text,
  	\`cta_enabled\` integer DEFAULT false,
  	\`cta_heading\` text,
  	\`cta_description\` text,
  	\`cta_cta_label\` text,
  	\`cta_cta_href\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "updated_at", "created_at") SELECT "id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
}
