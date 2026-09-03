import * as migration_20250929_111647 from "./20250929_111647"
import * as migration_20260411_082006_core_news from "./20260411_082006_core_news"
import * as migration_20260411_083019_core_faq from "./20260411_083019_core_faq"
import * as migration_20260411_084154_core_contact_submissions from "./20260411_084154_core_contact_submissions"
import * as migration_20260411_084620_core_site_settings from "./20260411_084620_core_site_settings"
import * as migration_20260411_101536_project_home_page from "./20260411_101536_project_home_page"
import * as migration_20260411_102709_core_drafts from "./20260411_102709_core_drafts"
import * as migration_20260411_104001_home_page_drafts from "./20260411_104001_home_page_drafts"
import * as migration_20260411_120111_core_seo_plugin from "./20260411_120111_core_seo_plugin"
import * as migration_20260411_120817_core_contact_required_status from "./20260411_120817_core_contact_required_status"
import * as migration_20260420_075159_core_extensions from "./20260420_075159_core_extensions"
import * as migration_20260521_065500_add_user_roles from "./20260521_065500_add_user_roles"
import * as migration_20260602_121751 from "./20260602_121751"
import * as migration_20260603_170022_works_collection from "./20260603_170022_works_collection"
import * as migration_20260702_170857_works_seo_meta from "./20260702_170857_works_seo_meta"
import * as migration_20260703_122632_add_localization from "./20260703_122632_add_localization"
import * as migration_20260714_154413_ai_translation from "./20260714_154413_ai_translation"
import * as migration_20260803_070926_enable_user_api_keys from "./20260803_070926_enable_user_api_keys"
import * as migration_20260803_074553_official_mcp_plugin from "./20260803_074553_official_mcp_plugin"
import * as migration_20260803_142729_mcp_security_hardening from "./20260803_142729_mcp_security_hardening"
import * as migration_20260803_143601_mcp_key_expiry from "./20260803_143601_mcp_key_expiry"
import * as migration_20260808_151600_cleanup_orphaned_document_locks from "./20260808_151600_cleanup_orphaned_document_locks"
import * as migration_20260903_190045_core_contact_notification_status from "./20260903_190045_core_contact_notification_status"

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: "20250929_111647",
  },
  {
    up: migration_20260411_082006_core_news.up,
    down: migration_20260411_082006_core_news.down,
    name: "20260411_082006_core_news",
  },
  {
    up: migration_20260411_083019_core_faq.up,
    down: migration_20260411_083019_core_faq.down,
    name: "20260411_083019_core_faq",
  },
  {
    up: migration_20260411_084154_core_contact_submissions.up,
    down: migration_20260411_084154_core_contact_submissions.down,
    name: "20260411_084154_core_contact_submissions",
  },
  {
    up: migration_20260411_084620_core_site_settings.up,
    down: migration_20260411_084620_core_site_settings.down,
    name: "20260411_084620_core_site_settings",
  },
  {
    up: migration_20260411_101536_project_home_page.up,
    down: migration_20260411_101536_project_home_page.down,
    name: "20260411_101536_project_home_page",
  },
  {
    up: migration_20260411_102709_core_drafts.up,
    down: migration_20260411_102709_core_drafts.down,
    name: "20260411_102709_core_drafts",
  },
  {
    up: migration_20260411_104001_home_page_drafts.up,
    down: migration_20260411_104001_home_page_drafts.down,
    name: "20260411_104001_home_page_drafts",
  },
  {
    up: migration_20260411_120111_core_seo_plugin.up,
    down: migration_20260411_120111_core_seo_plugin.down,
    name: "20260411_120111_core_seo_plugin",
  },
  {
    up: migration_20260411_120817_core_contact_required_status.up,
    down: migration_20260411_120817_core_contact_required_status.down,
    name: "20260411_120817_core_contact_required_status",
  },
  {
    up: migration_20260420_075159_core_extensions.up,
    down: migration_20260420_075159_core_extensions.down,
    name: "20260420_075159_core_extensions",
  },
  {
    up: migration_20260521_065500_add_user_roles.up,
    down: migration_20260521_065500_add_user_roles.down,
    name: "20260521_065500_add_user_roles",
  },
  {
    up: migration_20260602_121751.up,
    down: migration_20260602_121751.down,
    name: "20260602_121751",
  },
  {
    up: migration_20260603_170022_works_collection.up,
    down: migration_20260603_170022_works_collection.down,
    name: "20260603_170022_works_collection",
  },
  {
    up: migration_20260702_170857_works_seo_meta.up,
    down: migration_20260702_170857_works_seo_meta.down,
    name: "20260702_170857_works_seo_meta",
  },
  {
    up: migration_20260703_122632_add_localization.up,
    down: migration_20260703_122632_add_localization.down,
    name: "20260703_122632_add_localization",
  },
  {
    up: migration_20260714_154413_ai_translation.up,
    down: migration_20260714_154413_ai_translation.down,
    name: "20260714_154413_ai_translation",
  },
  {
    up: migration_20260803_070926_enable_user_api_keys.up,
    down: migration_20260803_070926_enable_user_api_keys.down,
    name: "20260803_070926_enable_user_api_keys",
  },
  {
    up: migration_20260803_074553_official_mcp_plugin.up,
    down: migration_20260803_074553_official_mcp_plugin.down,
    name: "20260803_074553_official_mcp_plugin",
  },
  {
    up: migration_20260803_142729_mcp_security_hardening.up,
    down: migration_20260803_142729_mcp_security_hardening.down,
    name: "20260803_142729_mcp_security_hardening",
  },
  {
    up: migration_20260803_143601_mcp_key_expiry.up,
    down: migration_20260803_143601_mcp_key_expiry.down,
    name: "20260803_143601_mcp_key_expiry",
  },
  {
    up: migration_20260808_151600_cleanup_orphaned_document_locks.up,
    down: migration_20260808_151600_cleanup_orphaned_document_locks.down,
    name: "20260808_151600_cleanup_orphaned_document_locks",
  },
  {
    up: migration_20260903_190045_core_contact_notification_status.up,
    down: migration_20260903_190045_core_contact_notification_status.down,
    name: "20260903_190045_core_contact_notification_status",
  },
]
