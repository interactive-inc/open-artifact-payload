import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_locales_meta_meta_image_idx\` ON \`news_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_locales_locale_parent_id_unique\` ON \`news_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_locales\` (
  	\`version_title\` text,
  	\`version_body\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_locales_version_meta_version_meta_image_idx\` ON \`_news_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_news_v_locales_locale_parent_id_unique\` ON \`_news_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`faq_locales\` (
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`faq_locales_locale_parent_id_unique\` ON \`faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`body\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_locales_meta_meta_image_idx\` ON \`works_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`works_locales_locale_parent_id_unique\` ON \`works_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_works_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_body\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_works_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_works_v_locales_version_meta_version_meta_image_idx\` ON \`_works_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_works_v_locales_locale_parent_id_unique\` ON \`_works_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_header_nav_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_header_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_header_nav_locales_locale_parent_id_unique\` ON \`site_settings_header_nav_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_footer_nav_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_footer_nav_locales_locale_parent_id_unique\` ON \`site_settings_footer_nav_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_policy_links_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_policy_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_policy_links_locales_locale_parent_id_unique\` ON \`site_settings_policy_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`site_name\` text NOT NULL,
  	\`footer_text\` text,
  	\`company_info_address\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_services_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_services_items_locales_locale_parent_id_unique\` ON \`home_page_services_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`hero_cta_label\` text,
  	\`services_heading\` text,
  	\`services_subheading\` text,
  	\`about_preview_heading\` text,
  	\`about_preview_description\` text,
  	\`about_preview_cta_label\` text,
  	\`featured_news_heading\` text,
  	\`cta_heading\` text,
  	\`cta_description\` text,
  	\`cta_cta_label\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_locales_meta_meta_image_idx\` ON \`home_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_services_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_version_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_version_services_items_locales_locale_parent_id\` ON \`_home_page_v_version_services_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_locales\` (
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_hero_cta_label\` text,
  	\`version_services_heading\` text,
  	\`version_services_subheading\` text,
  	\`version_about_preview_heading\` text,
  	\`version_about_preview_description\` text,
  	\`version_about_preview_cta_label\` text,
  	\`version_featured_news_heading\` text,
  	\`version_cta_heading\` text,
  	\`version_cta_description\` text,
  	\`version_cta_cta_label\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_locales_version_meta_version_meta_image_idx\` ON \`_home_page_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_locales_locale_parent_id_unique\` ON \`_home_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_mission_values_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_mission_values\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_mission_values_locales_locale_parent_id_unique\` ON \`about_mission_values_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_company_profile_rows_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_company_profile_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_company_profile_rows_locales_locale_parent_id_unique\` ON \`about_company_profile_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_members_items_locales\` (
  	\`name\` text,
  	\`position\` text,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_members_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_members_items_locales_locale_parent_id_unique\` ON \`about_members_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_locales\` (
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`mission_heading\` text,
  	\`mission_description\` text,
  	\`company_profile_heading\` text,
  	\`members_heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_locales_locale_parent_id_unique\` ON \`about_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_mission_values_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v_version_mission_values\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_v_version_mission_values_locales_locale_parent_id_uni\` ON \`_about_v_version_mission_values_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_company_profile_rows_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v_version_company_profile_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_v_version_company_profile_rows_locales_locale_parent_\` ON \`_about_v_version_company_profile_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_version_members_items_locales\` (
  	\`name\` text,
  	\`position\` text,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v_version_members_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_v_version_members_items_locales_locale_parent_id_uniq\` ON \`_about_v_version_members_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_v_locales\` (
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_mission_heading\` text,
  	\`version_mission_description\` text,
  	\`version_company_profile_heading\` text,
  	\`version_members_heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_v_locales_locale_parent_id_unique\` ON \`_about_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_services_items_features_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_services_items_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_services_items_features_locales_locale_parent_id_uni\` ON \`service_services_items_features_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_services_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_services_items_locales_locale_parent_id_unique\` ON \`service_services_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_process_steps_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_process_steps_locales_locale_parent_id_unique\` ON \`service_process_steps_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_locales\` (
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`services_heading\` text,
  	\`process_heading\` text,
  	\`cta_heading\` text,
  	\`cta_description\` text,
  	\`cta_cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_locales_locale_parent_id_unique\` ON \`service_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_services_items_features_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v_version_services_items_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_service_v_version_services_items_features_locales_locale_pa\` ON \`_service_v_version_services_items_features_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_services_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v_version_services_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_service_v_version_services_items_locales_locale_parent_id_u\` ON \`_service_v_version_services_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_version_process_steps_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v_version_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_service_v_version_process_steps_locales_locale_parent_id_un\` ON \`_service_v_version_process_steps_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_service_v_locales\` (
  	\`version_hero_title\` text,
  	\`version_hero_subtitle\` text,
  	\`version_services_heading\` text,
  	\`version_process_heading\` text,
  	\`version_cta_heading\` text,
  	\`version_cta_description\` text,
  	\`version_cta_cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_service_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_service_v_locales_locale_parent_id_unique\` ON \`_service_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`published_at\` text,
  	\`category\` text DEFAULT 'info',
  	\`thumbnail_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_news\`("id", "slug", "published_at", "category", "thumbnail_id", "updated_at", "created_at", "_status") SELECT "id", "slug", "published_at", "category", "thumbnail_id", "updated_at", "created_at", "_status" FROM \`news\`;`)
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
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_category\` text DEFAULT 'info',
  	\`version_thumbnail_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__news_v\`("id", "parent_id", "version_slug", "version_published_at", "version_category", "version_thumbnail_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest", "autosave") SELECT "id", "parent_id", "version_slug", "version_published_at", "version_category", "version_thumbnail_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest", "autosave" FROM \`_news_v\`;`)
  await db.run(sql`DROP TABLE \`_news_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__news_v\` RENAME TO \`_news_v\`;`)
  await db.run(sql`CREATE INDEX \`_news_v_parent_idx\` ON \`_news_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_slug_idx\` ON \`_news_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_thumbnail_idx\` ON \`_news_v\` (\`version_thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_updated_at_idx\` ON \`_news_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_created_at_idx\` ON \`_news_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version__status_idx\` ON \`_news_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_created_at_idx\` ON \`_news_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_updated_at_idx\` ON \`_news_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_snapshot_idx\` ON \`_news_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_published_locale_idx\` ON \`_news_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_latest_idx\` ON \`_news_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_autosave_idx\` ON \`_news_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`__new_works\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`category\` text DEFAULT 'web',
  	\`published_at\` text,
  	\`thumbnail_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_works\`("id", "slug", "category", "published_at", "thumbnail_id", "updated_at", "created_at", "_status") SELECT "id", "slug", "category", "published_at", "thumbnail_id", "updated_at", "created_at", "_status" FROM \`works\`;`)
  await db.run(sql`DROP TABLE \`works\`;`)
  await db.run(sql`ALTER TABLE \`__new_works\` RENAME TO \`works\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`works_slug_idx\` ON \`works\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`works_thumbnail_idx\` ON \`works\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`works_updated_at_idx\` ON \`works\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`works_created_at_idx\` ON \`works\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`works__status_idx\` ON \`works\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__works_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_category\` text DEFAULT 'web',
  	\`version_published_at\` text,
  	\`version_thumbnail_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__works_v\`("id", "parent_id", "version_slug", "version_category", "version_published_at", "version_thumbnail_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest", "autosave") SELECT "id", "parent_id", "version_slug", "version_category", "version_published_at", "version_thumbnail_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "snapshot", "published_locale", "latest", "autosave" FROM \`_works_v\`;`)
  await db.run(sql`DROP TABLE \`_works_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__works_v\` RENAME TO \`_works_v\`;`)
  await db.run(sql`CREATE INDEX \`_works_v_parent_idx\` ON \`_works_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_slug_idx\` ON \`_works_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_thumbnail_idx\` ON \`_works_v\` (\`version_thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_updated_at_idx\` ON \`_works_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_created_at_idx\` ON \`_works_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version__status_idx\` ON \`_works_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_created_at_idx\` ON \`_works_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_updated_at_idx\` ON \`_works_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_snapshot_idx\` ON \`_works_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_published_locale_idx\` ON \`_works_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_latest_idx\` ON \`_works_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_autosave_idx\` ON \`_works_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_enabled\` integer DEFAULT true,
  	\`hero_image_id\` integer,
  	\`hero_cta_href\` text,
  	\`services_enabled\` integer DEFAULT true,
  	\`about_preview_enabled\` integer DEFAULT true,
  	\`about_preview_image_id\` integer,
  	\`about_preview_cta_href\` text,
  	\`featured_news_enabled\` integer DEFAULT true,
  	\`cta_enabled\` integer DEFAULT false,
  	\`cta_cta_href\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`about_preview_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "hero_enabled", "hero_image_id", "hero_cta_href", "services_enabled", "about_preview_enabled", "about_preview_image_id", "about_preview_cta_href", "featured_news_enabled", "cta_enabled", "cta_cta_href", "_status", "updated_at", "created_at") SELECT "id", "hero_enabled", "hero_image_id", "hero_cta_href", "services_enabled", "about_preview_enabled", "about_preview_image_id", "about_preview_cta_href", "featured_news_enabled", "cta_enabled", "cta_cta_href", "_status", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_about_preview_about_preview_image_idx\` ON \`home_page\` (\`about_preview_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_enabled\` integer DEFAULT true,
  	\`version_hero_image_id\` integer,
  	\`version_hero_cta_href\` text,
  	\`version_services_enabled\` integer DEFAULT true,
  	\`version_about_preview_enabled\` integer DEFAULT true,
  	\`version_about_preview_image_id\` integer,
  	\`version_about_preview_cta_href\` text,
  	\`version_featured_news_enabled\` integer DEFAULT true,
  	\`version_cta_enabled\` integer DEFAULT false,
  	\`version_cta_cta_href\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_about_preview_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v\`("id", "version_hero_enabled", "version_hero_image_id", "version_hero_cta_href", "version_services_enabled", "version_about_preview_enabled", "version_about_preview_image_id", "version_about_preview_cta_href", "version_featured_news_enabled", "version_cta_enabled", "version_cta_cta_href", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "snapshot", "published_locale", "latest") SELECT "id", "version_hero_enabled", "version_hero_image_id", "version_hero_cta_href", "version_services_enabled", "version_about_preview_enabled", "version_about_preview_image_id", "version_about_preview_cta_href", "version_featured_news_enabled", "version_cta_enabled", "version_cta_cta_href", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "snapshot", "published_locale", "latest" FROM \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v\` RENAME TO \`_home_page_v\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_image_idx\` ON \`_home_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_preview_version_about_preview_idx\` ON \`_home_page_v\` (\`version_about_preview_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_snapshot_idx\` ON \`_home_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_published_locale_idx\` ON \`_home_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`snapshot\` integer;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`published_locale\` text;`)
  await db.run(sql`CREATE INDEX \`_about_v_snapshot_idx\` ON \`_about_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_about_v_published_locale_idx\` ON \`_about_v\` (\`published_locale\`);`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_hero_title\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_hero_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_mission_heading\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_mission_description\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_company_profile_heading\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`version_members_heading\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`snapshot\` integer;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`published_locale\` text;`)
  await db.run(sql`CREATE INDEX \`_service_v_snapshot_idx\` ON \`_service_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_service_v_published_locale_idx\` ON \`_service_v\` (\`published_locale\`);`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_hero_title\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_hero_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_services_heading\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_process_heading\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_cta_heading\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_cta_description\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`version_cta_cta_label\`;`)
  await db.run(sql`ALTER TABLE \`faq\` DROP COLUMN \`question\`;`)
  await db.run(sql`ALTER TABLE \`faq\` DROP COLUMN \`answer\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_header_nav\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_footer_nav\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_policy_links\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`site_name\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`footer_text\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`company_info_address\`;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`about_mission_values\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`about_mission_values\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`about_company_profile_rows\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`about_company_profile_rows\` DROP COLUMN \`value\`;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` DROP COLUMN \`name\`;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` DROP COLUMN \`position\`;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` DROP COLUMN \`bio\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`hero_title\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`hero_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`mission_heading\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`mission_description\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`company_profile_heading\`;`)
  await db.run(sql`ALTER TABLE \`about\` DROP COLUMN \`members_heading\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_mission_values\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_mission_values\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_company_profile_rows\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_company_profile_rows\` DROP COLUMN \`value\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` DROP COLUMN \`name\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` DROP COLUMN \`position\`;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` DROP COLUMN \`bio\`;`)
  await db.run(sql`ALTER TABLE \`service_services_items_features\` DROP COLUMN \`text\`;`)
  await db.run(sql`ALTER TABLE \`service_services_items\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`service_services_items\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`service_process_steps\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`service_process_steps\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`hero_title\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`hero_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`services_heading\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`process_heading\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`cta_heading\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`cta_description\`;`)
  await db.run(sql`ALTER TABLE \`service\` DROP COLUMN \`cta_cta_label\`;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items_features\` DROP COLUMN \`text\`;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_process_steps\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_process_steps\` DROP COLUMN \`description\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`news_locales\`;`)
  await db.run(sql`DROP TABLE \`_news_v_locales\`;`)
  await db.run(sql`DROP TABLE \`faq_locales\`;`)
  await db.run(sql`DROP TABLE \`works_locales\`;`)
  await db.run(sql`DROP TABLE \`_works_v_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_header_nav_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_nav_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_policy_links_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_services_items_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_services_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`about_mission_values_locales\`;`)
  await db.run(sql`DROP TABLE \`about_company_profile_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`about_members_items_locales\`;`)
  await db.run(sql`DROP TABLE \`about_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_mission_values_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_company_profile_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_v_version_members_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_v_locales\`;`)
  await db.run(sql`DROP TABLE \`service_services_items_features_locales\`;`)
  await db.run(sql`DROP TABLE \`service_services_items_locales\`;`)
  await db.run(sql`DROP TABLE \`service_process_steps_locales\`;`)
  await db.run(sql`DROP TABLE \`service_locales\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_services_items_features_locales\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_services_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_service_v_version_process_steps_locales\`;`)
  await db.run(sql`DROP TABLE \`_service_v_locales\`;`)
  await db.run(sql`DROP INDEX \`_news_v_snapshot_idx\`;`)
  await db.run(sql`DROP INDEX \`_news_v_published_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_title\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_body\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_news_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_meta_version_meta_image_idx\` ON \`_news_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_news_v\` DROP COLUMN \`snapshot\`;`)
  await db.run(sql`ALTER TABLE \`_news_v\` DROP COLUMN \`published_locale\`;`)
  await db.run(sql`DROP INDEX \`_works_v_snapshot_idx\`;`)
  await db.run(sql`DROP INDEX \`_works_v_published_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_title\` text;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_summary\` text;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_body\` text;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_meta_version_meta_image_idx\` ON \`_works_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_works_v\` DROP COLUMN \`snapshot\`;`)
  await db.run(sql`ALTER TABLE \`_works_v\` DROP COLUMN \`published_locale\`;`)
  await db.run(sql`DROP INDEX \`_home_page_v_snapshot_idx\`;`)
  await db.run(sql`DROP INDEX \`_home_page_v_published_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_hero_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_description\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_preview_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_news_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_cta_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_meta_version_meta_image_idx\` ON \`_home_page_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`snapshot\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`published_locale\`;`)
  await db.run(sql`DROP INDEX \`_about_v_snapshot_idx\`;`)
  await db.run(sql`DROP INDEX \`_about_v_published_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_mission_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_mission_description\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_company_profile_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` ADD \`version_members_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`snapshot\`;`)
  await db.run(sql`ALTER TABLE \`_about_v\` DROP COLUMN \`published_locale\`;`)
  await db.run(sql`DROP INDEX \`_service_v_snapshot_idx\`;`)
  await db.run(sql`DROP INDEX \`_service_v_published_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_process_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` ADD \`version_cta_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`snapshot\`;`)
  await db.run(sql`ALTER TABLE \`_service_v\` DROP COLUMN \`published_locale\`;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`news\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`news_meta_meta_image_idx\` ON \`news\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`faq\` ADD \`question\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`faq\` ADD \`answer\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`summary\` text;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`works_meta_meta_image_idx\` ON \`works\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings_header_nav\` ADD \`label\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`site_settings_footer_nav\` ADD \`label\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`site_settings_policy_links\` ADD \`label\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`site_name\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`footer_text\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`company_info_address\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`hero_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_preview_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_news_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`cta_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`home_page_meta_meta_image_idx\` ON \`home_page\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`about_mission_values\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`about_mission_values\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`about_company_profile_rows\` ADD \`label\` text;`)
  await db.run(sql`ALTER TABLE \`about_company_profile_rows\` ADD \`value\` text;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` ADD \`name\` text;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` ADD \`position\` text;`)
  await db.run(sql`ALTER TABLE \`about_members_items\` ADD \`bio\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`mission_heading\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`mission_description\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`company_profile_heading\` text;`)
  await db.run(sql`ALTER TABLE \`about\` ADD \`members_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_mission_values\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_mission_values\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_company_profile_rows\` ADD \`label\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_company_profile_rows\` ADD \`value\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` ADD \`name\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` ADD \`position\` text;`)
  await db.run(sql`ALTER TABLE \`_about_v_version_members_items\` ADD \`bio\` text;`)
  await db.run(sql`ALTER TABLE \`service_services_items_features\` ADD \`text\` text;`)
  await db.run(sql`ALTER TABLE \`service_services_items\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`service_services_items\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`service_process_steps\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`service_process_steps\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`hero_title\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`hero_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`services_heading\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`process_heading\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`service\` ADD \`cta_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items_features\` ADD \`text\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_services_items\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_process_steps\` ADD \`title\` text;`)
  await db.run(sql`ALTER TABLE \`_service_v_version_process_steps\` ADD \`description\` text;`)
}
