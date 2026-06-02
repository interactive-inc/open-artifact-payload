import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`home_page_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_services_items_order_idx\` ON \`home_page_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_services_items_parent_id_idx\` ON \`home_page_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_services_items_order_idx\` ON \`_home_page_v_version_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_services_items_parent_id_idx\` ON \`_home_page_v_version_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_mission_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_mission_values_order_idx\` ON \`about_mission_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_mission_values_parent_id_idx\` ON \`about_mission_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_company_profile_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_company_profile_rows_order_idx\` ON \`about_company_profile_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_company_profile_rows_parent_id_idx\` ON \`about_company_profile_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_members_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`position\` text,
  	\`bio\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_members_items_order_idx\` ON \`about_members_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_members_items_parent_id_idx\` ON \`about_members_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_members_items_image_idx\` ON \`about_members_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`about\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_enabled\` integer DEFAULT true,
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`mission_enabled\` integer DEFAULT true,
  	\`mission_heading\` text,
  	\`mission_description\` text,
  	\`company_profile_enabled\` integer DEFAULT true,
  	\`company_profile_heading\` text,
  	\`members_enabled\` integer DEFAULT true,
  	\`members_heading\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`about__status_idx\` ON \`about\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_mission_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_v_version_mission_values_order_idx\` ON \`_about_v_version_mission_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_version_mission_values_parent_id_idx\` ON \`_about_v_version_mission_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_company_profile_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_v_version_company_profile_rows_order_idx\` ON \`_about_v_version_company_profile_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_version_company_profile_rows_parent_id_idx\` ON \`_about_v_version_company_profile_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_members_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`position\` text,
  	\`bio\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_v_version_members_items_order_idx\` ON \`_about_v_version_members_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_version_members_items_parent_id_idx\` ON \`_about_v_version_members_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_version_members_items_image_idx\` ON \`_about_v_version_members_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_enabled\` integer DEFAULT true,
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_mission_enabled\` integer DEFAULT true,
  	\`version_mission_heading\` text,
  	\`version_mission_description\` text,
  	\`version_company_profile_enabled\` integer DEFAULT true,
  	\`version_company_profile_heading\` text,
  	\`version_members_enabled\` integer DEFAULT true,
  	\`version_members_heading\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_v_version_version__status_idx\` ON \`_about_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_created_at_idx\` ON \`_about_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_updated_at_idx\` ON \`_about_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_latest_idx\` ON \`_about_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`service_services_items_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_services_items_features_order_idx\` ON \`service_services_items_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_services_items_features_parent_id_idx\` ON \`service_services_items_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_services_items_order_idx\` ON \`service_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_services_items_parent_id_idx\` ON \`service_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_process_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_process_steps_order_idx\` ON \`service_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_process_steps_parent_id_idx\` ON \`service_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_enabled\` integer DEFAULT true,
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`services_enabled\` integer DEFAULT true,
  	\`services_heading\` text,
  	\`process_enabled\` integer DEFAULT true,
  	\`process_heading\` text,
  	\`cta_enabled\` integer DEFAULT false,
  	\`cta_heading\` text,
  	\`cta_description\` text,
  	\`cta_cta_label\` text,
  	\`cta_cta_href\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`service__status_idx\` ON \`service\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_services_items_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v_version_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_service_v_version_services_items_features_order_idx\` ON \`_service_v_version_services_items_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_version_services_items_features_parent_id_idx\` ON \`_service_v_version_services_items_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_service_v_version_services_items_order_idx\` ON \`_service_v_version_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_version_services_items_parent_id_idx\` ON \`_service_v_version_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_process_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_service_v_version_process_steps_order_idx\` ON \`_service_v_version_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_version_process_steps_parent_id_idx\` ON \`_service_v_version_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_enabled\` integer DEFAULT true,
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_services_enabled\` integer DEFAULT true,
  	\`version_services_heading\` text,
  	\`version_process_enabled\` integer DEFAULT true,
  	\`version_process_heading\` text,
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
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_service_v_version_version__status_idx\` ON \`_service_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_created_at_idx\` ON \`_service_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_updated_at_idx\` ON \`_service_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_latest_idx\` ON \`_service_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_cta_href\` text;`)
  await db.run(sql`CREATE INDEX \`home_page_about_preview_about_preview_image_idx\` ON \`home_page\` (\`about_preview_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_description\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_cta_href\` text;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_preview_version_about_preview_idx\` ON \`_home_page_v\` (\`version_about_preview_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`home_page_services_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_services_items\`;`)
  await db.run(sql`DROP TABLE \`about_mission_values\`;`)
  await db.run(sql`DROP TABLE \`about_company_profile_rows\`;`)
  await db.run(sql`DROP TABLE \`about_members_items\`;`)
  await db.run(sql`DROP TABLE \`about\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_mission_values\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_company_profile_rows\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_members_items\`;`)
  await db.run(sql`DROP TABLE \`_about_v\`;`)
  await db.run(sql`DROP TABLE \`service_services_items_features\`;`)
  await db.run(sql`DROP TABLE \`service_services_items\`;`)
  await db.run(sql`DROP TABLE \`service_process_steps\`;`)
  await db.run(sql`DROP TABLE \`service\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_services_items_features\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_services_items\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_service_v\`;`)
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
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "meta_title", "meta_description", "meta_image_id", "_status", "updated_at", "created_at") SELECT "id", "hero_enabled", "hero_title", "hero_subtitle", "hero_image_id", "hero_cta_label", "hero_cta_href", "featured_news_enabled", "featured_news_heading", "cta_enabled", "cta_heading", "cta_description", "cta_cta_label", "cta_cta_href", "meta_title", "meta_description", "meta_image_id", "_status", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_meta_meta_image_idx\` ON \`home_page\` (\`meta_image_id\`);`)
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
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v\`("id", "version_hero_enabled", "version_hero_title", "version_hero_subtitle", "version_hero_image_id", "version_hero_cta_label", "version_hero_cta_href", "version_featured_news_enabled", "version_featured_news_heading", "version_cta_enabled", "version_cta_heading", "version_cta_description", "version_cta_cta_label", "version_cta_cta_href", "version_meta_title", "version_meta_description", "version_meta_image_id", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_hero_enabled", "version_hero_title", "version_hero_subtitle", "version_hero_image_id", "version_hero_cta_label", "version_hero_cta_href", "version_featured_news_enabled", "version_featured_news_heading", "version_cta_enabled", "version_cta_heading", "version_cta_description", "version_cta_cta_label", "version_cta_cta_href", "version_meta_title", "version_meta_description", "version_meta_image_id", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v\` RENAME TO \`_home_page_v\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_image_idx\` ON \`_home_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_meta_version_meta_image_idx\` ON \`_home_page_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
}
