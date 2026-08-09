import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-d1-sqlite"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`news_meta_meta_image_idx\` ON \`news\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_meta_description\` text;`)
  await db.run(
    sql`ALTER TABLE \`_news_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`_news_v_version_meta_version_meta_image_idx\` ON \`_news_v\` (\`version_meta_image_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(
    sql`CREATE INDEX \`home_page_meta_meta_image_idx\` ON \`home_page\` (\`meta_image_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_description\` text;`)
  await db.run(
    sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`_home_page_v_version_meta_version_meta_image_idx\` ON \`_home_page_v\` (\`version_meta_image_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`published_at\` text,
  	\`category\` text DEFAULT 'info',
  	\`thumbnail_id\` integer,
  	\`body\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_news\`("id", "title", "slug", "published_at", "category", "thumbnail_id", "body", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "published_at", "category", "thumbnail_id", "body", "updated_at", "created_at", "_status" FROM \`news\`;`,
  )
  await db.run(sql`DROP TABLE \`news\`;`)
  await db.run(sql`ALTER TABLE \`__new_news\` RENAME TO \`news\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_slug_idx\` ON \`news\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`news_thumbnail_idx\` ON \`news\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`news_updated_at_idx\` ON \`news\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_created_at_idx\` ON \`news\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`news__status_idx\` ON \`news\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__news_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_category\` text DEFAULT 'info',
  	\`version_thumbnail_id\` integer,
  	\`version_body\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__news_v\`("id", "parent_id", "version_title", "version_slug", "version_published_at", "version_category", "version_thumbnail_id", "version_body", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave") SELECT "id", "parent_id", "version_title", "version_slug", "version_published_at", "version_category", "version_thumbnail_id", "version_body", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave" FROM \`_news_v\`;`,
  )
  await db.run(sql`DROP TABLE \`_news_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__news_v\` RENAME TO \`_news_v\`;`)
  await db.run(sql`CREATE INDEX \`_news_v_parent_idx\` ON \`_news_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_news_v_version_version_slug_idx\` ON \`_news_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_news_v_version_version_thumbnail_idx\` ON \`_news_v\` (\`version_thumbnail_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_news_v_version_version_updated_at_idx\` ON \`_news_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_news_v_version_version_created_at_idx\` ON \`_news_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_news_v_version_version__status_idx\` ON \`_news_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_news_v_created_at_idx\` ON \`_news_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_updated_at_idx\` ON \`_news_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_latest_idx\` ON \`_news_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_autosave_idx\` ON \`_news_v\` (\`autosave\`);`)
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
  await db.run(
    sql`INSERT INTO \`__new_home_page\`("id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "_status", "updated_at", "created_at") SELECT "id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "_status", "updated_at", "created_at" FROM \`home_page\`;`,
  )
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(
    sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v\` (
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
  await db.run(
    sql`INSERT INTO \`__new__home_page_v\`("id", "version_hero_enabled", "version_hero_title", "version_hero_subtitle", "version_hero_image_id", "version_hero_cta_label", "version_hero_cta_href", "version_featured_news_enabled", "version_featured_news_heading", "version_cta_enabled", "version_cta_heading", "version_cta_description", "version_cta_cta_label", "version_cta_cta_href", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest", "autosave") SELECT "id", "version_hero_enabled", "version_hero_title", "version_hero_subtitle", "version_hero_image_id", "version_hero_cta_label", "version_hero_cta_href", "version_featured_news_enabled", "version_featured_news_heading", "version_cta_enabled", "version_cta_heading", "version_cta_description", "version_cta_cta_label", "version_cta_cta_href", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest", "autosave" FROM \`_home_page_v\`;`,
  )
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v\` RENAME TO \`_home_page_v\`;`)
  await db.run(
    sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_image_idx\` ON \`_home_page_v\` (\`version_hero_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_autosave_idx\` ON \`_home_page_v\` (\`autosave\`);`)
}
