/**
 * Central message export for next-intl with modular translations.
 *
 * This file imports all modular translation files (common, auth, navbar, etc.)
 * and merges them into a single object for both app and Storybook usage.
 *
 * Modular structure:
 *   locales/en/common.json        - Global UI strings
 *   locales/en/auth.json          - Authentication strings
 *   locales/en/navbar.json        - Navigation strings
 *   locales/en/footer.json        - Footer strings
 *   locales/en/account-dropdown.json - Component namespace
 *   locales/en/list-card.json     - Component namespace
 *   ...and more
 *
 * The merged result:
 *   {
 *     "common": {...},
 *     "auth": {...},
 *     "navbar": {...},
 *     "AccountDropdown": {...},   // kebab-case file → camelCase namespace
 *     "ListCard": {...},
 *     ...etc
 *   }
 */
import commonEn from '../../locales/en/common.json';
import authEn from '../../locales/en/auth.json';
import navbarEn from '../../locales/en/navbar.json';
import footerEn from '../../locales/en/footer.json';
import dashboardEn from '../../locales/en/dashboard.json';
import discoverEn from '../../locales/en/discover.json';
import latestEn from '../../locales/en/latest.json';
import curatorsEn from '../../locales/en/curators.json';
import profileEn from '../../locales/en/profile.json';
import listPageEn from '../../locales/en/list-page.json';
import modalsEn from '../../locales/en/modals.json';
import formsEn from '../../locales/en/forms.json';

// Component namespaces (kebab-case files → camelCase namespace keys)
import accountDropdownEn from '../../locales/en/account-dropdown.json';
import listCardEn from '../../locales/en/list-card.json';
import itemEn from '../../locales/en/item.json';
import curatorMetaEn from '../../locales/en/curator-meta.json';
import listOptionsDropdownEn from '../../locales/en/list-options-dropdown.json';
import heroEn from '../../locales/en/hero.json';
import sectionHeaderEn from '../../locales/en/section-header.json';

import commonFr from '../../locales/fr/common.json';
import authFr from '../../locales/fr/auth.json';
import navbarFr from '../../locales/fr/navbar.json';
import footerFr from '../../locales/fr/footer.json';
import dashboardFr from '../../locales/fr/dashboard.json';
import discoverFr from '../../locales/fr/discover.json';
import latestFr from '../../locales/fr/latest.json';
import curatorsFr from '../../locales/fr/curators.json';
import profileFr from '../../locales/fr/profile.json';
import listPageFr from '../../locales/fr/list-page.json';
import modalsFr from '../../locales/fr/modals.json';
import formsFr from '../../locales/fr/forms.json';

// Component namespaces (kebab-case files → camelCase namespace keys)
import accountDropdownFr from '../../locales/fr/account-dropdown.json';
import listCardFr from '../../locales/fr/list-card.json';
import itemFr from '../../locales/fr/item.json';
import curatorMetaFr from '../../locales/fr/curator-meta.json';
import listOptionsDropdownFr from '../../locales/fr/list-options-dropdown.json';
import heroFr from '../../locales/fr/hero.json';
import sectionHeaderFr from '../../locales/fr/section-header.json';

/**
 * Merge all modular translation files into a single namespace object.
 * Each module name becomes a top-level key in the messages object.
 * Kebab-case component files are mapped to camelCase namespace keys.
 */
const messagesEn = {
  common: commonEn,
  auth: authEn,
  navbar: navbarEn,
  footer: footerEn,
  dashboard: dashboardEn,
  discover: discoverEn,
  latest: latestEn,
  curators: curatorsEn,
  profile: profileEn,
  'list-page': listPageEn,
  modals: modalsEn,
  forms: formsEn,
  // Component namespaces (camelCase for useTranslations usage)
  AccountDropdown: accountDropdownEn,
  ListCard: listCardEn,
  Item: itemEn,
  CuratorMeta: curatorMetaEn,
  ListOptionsDropdown: listOptionsDropdownEn,
  Hero: heroEn,
  SectionHeader: sectionHeaderEn,
};

const messagesFr = {
  common: commonFr,
  auth: authFr,
  navbar: navbarFr,
  footer: footerFr,
  dashboard: dashboardFr,
  discover: discoverFr,
  latest: latestFr,
  curators: curatorsFr,
  profile: profileFr,
  'list-page': listPageFr,
  modals: modalsFr,
  forms: formsFr,
  // Component namespaces (camelCase for useTranslations usage)
  AccountDropdown: accountDropdownFr,
  ListCard: listCardFr,
  Item: itemFr,
  CuratorMeta: curatorMetaFr,
  ListOptionsDropdown: listOptionsDropdownFr,
  Hero: heroFr,
  SectionHeader: sectionHeaderFr,
};

export const messages = {
  en: messagesEn,
  fr: messagesFr,
} as const;

export default messagesEn;
