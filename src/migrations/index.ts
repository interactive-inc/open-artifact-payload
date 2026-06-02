import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260411_082006_core_news from './20260411_082006_core_news';
import * as migration_20260411_083019_core_faq from './20260411_083019_core_faq';
import * as migration_20260411_084154_core_contact_submissions from './20260411_084154_core_contact_submissions';
import * as migration_20260411_084620_core_site_settings from './20260411_084620_core_site_settings';
import * as migration_20260411_101536_project_home_page from './20260411_101536_project_home_page';
import * as migration_20260411_102709_core_drafts from './20260411_102709_core_drafts';
import * as migration_20260411_104001_home_page_drafts from './20260411_104001_home_page_drafts';
import * as migration_20260411_120111_core_seo_plugin from './20260411_120111_core_seo_plugin';
import * as migration_20260411_120817_core_contact_required_status from './20260411_120817_core_contact_required_status';
import * as migration_20260420_075159_core_extensions from './20260420_075159_core_extensions';
import * as migration_20260521_065500_add_user_roles from './20260521_065500_add_user_roles';
import * as migration_20260602_121751 from './20260602_121751';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260411_082006_core_news.up,
    down: migration_20260411_082006_core_news.down,
    name: '20260411_082006_core_news',
  },
  {
    up: migration_20260411_083019_core_faq.up,
    down: migration_20260411_083019_core_faq.down,
    name: '20260411_083019_core_faq',
  },
  {
    up: migration_20260411_084154_core_contact_submissions.up,
    down: migration_20260411_084154_core_contact_submissions.down,
    name: '20260411_084154_core_contact_submissions',
  },
  {
    up: migration_20260411_084620_core_site_settings.up,
    down: migration_20260411_084620_core_site_settings.down,
    name: '20260411_084620_core_site_settings',
  },
  {
    up: migration_20260411_101536_project_home_page.up,
    down: migration_20260411_101536_project_home_page.down,
    name: '20260411_101536_project_home_page',
  },
  {
    up: migration_20260411_102709_core_drafts.up,
    down: migration_20260411_102709_core_drafts.down,
    name: '20260411_102709_core_drafts',
  },
  {
    up: migration_20260411_104001_home_page_drafts.up,
    down: migration_20260411_104001_home_page_drafts.down,
    name: '20260411_104001_home_page_drafts',
  },
  {
    up: migration_20260411_120111_core_seo_plugin.up,
    down: migration_20260411_120111_core_seo_plugin.down,
    name: '20260411_120111_core_seo_plugin',
  },
  {
    up: migration_20260411_120817_core_contact_required_status.up,
    down: migration_20260411_120817_core_contact_required_status.down,
    name: '20260411_120817_core_contact_required_status',
  },
  {
    up: migration_20260420_075159_core_extensions.up,
    down: migration_20260420_075159_core_extensions.down,
    name: '20260420_075159_core_extensions',
  },
  {
    up: migration_20260521_065500_add_user_roles.up,
    down: migration_20260521_065500_add_user_roles.down,
    name: '20260521_065500_add_user_roles',
  },
  {
    up: migration_20260602_121751.up,
    down: migration_20260602_121751.down,
    name: '20260602_121751'
  },
];
