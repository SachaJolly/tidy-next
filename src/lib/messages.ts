/**
 * Central message export for next-intl with modular translations.
 *
 * This file imports all modular translation files (common, auth, navbar, etc.)
 * and merges them into a single object for both app and Storybook usage.
 *
 * Modular structure:
 *   locales/en/common.json           - Global UI strings
 *   locales/en/auth.json             - Authentication strings
 *   locales/en/navbar.json           - Navigation strings
 *   locales/en/footer.json           - Footer strings
 *   locales/en/NewList.json          - Modal namespace (PascalCase)
 *   locales/en/EditListModal.json    - Modal namespace (PascalCase)
 *   locales/en/AccountDropdown.json  - Component namespace (PascalCase)
 *   locales/en/ListCard.json         - Component namespace (PascalCase)
 *   ...and more
 *
 * Naming convention:
 *   - Lowercase files → lowercase namespace keys: common, auth, navbar, footer, etc.
 *   - PascalCase files → PascalCase namespace keys: NewList, EditListModal, ListCard, etc.
 *
 * The merged result:
 *   {
 *     "common": {...},
 *     "auth": {...},
 *     "navbar": {...},
 *     "NewList": {...},
 *     "EditListModal": {...},
 *     "AccountDropdown": {...},
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
import ListPageEn from '../../locales/en/ListPage.json';
import formsEn from '../../locales/en/forms.json';

// Modal namespaces (PascalCase files → PascalCase namespace keys)
import NewListEn from '../../locales/en/NewList.json';
import EditListModalEn from '../../locales/en/EditListModal.json';

// Component namespaces (PascalCase files → PascalCase namespace keys)
import AccountDropdownEn from '../../locales/en/AccountDropdown.json';
import ListCardEn from '../../locales/en/ListCard.json';
import itemEn from '../../locales/en/item.json';
import CuratorMetaEn from '../../locales/en/CuratorMeta.json';
import ListOptionsDropdownEn from '../../locales/en/ListOptionsDropdown.json';
import HeroEn from '../../locales/en/Hero.json';
import SectionHeaderEn from '../../locales/en/SectionHeader.json';

import commonFr from '../../locales/fr/common.json';
import authFr from '../../locales/fr/auth.json';
import navbarFr from '../../locales/fr/navbar.json';
import footerFr from '../../locales/fr/footer.json';
import dashboardFr from '../../locales/fr/dashboard.json';
import discoverFr from '../../locales/fr/discover.json';
import latestFr from '../../locales/fr/latest.json';
import curatorsFr from '../../locales/fr/curators.json';
import profileFr from '../../locales/fr/profile.json';
import ListPageFr from '../../locales/fr/ListPage.json';
import formsFr from '../../locales/fr/forms.json';

// Modal namespaces (PascalCase files → PascalCase namespace keys)
import NewListFr from '../../locales/fr/NewList.json';
import EditListModalFr from '../../locales/fr/EditListModal.json';

// Component namespaces (PascalCase files → PascalCase namespace keys)
import AccountDropdownFr from '../../locales/fr/AccountDropdown.json';
import ListCardFr from '../../locales/fr/ListCard.json';
import itemFr from '../../locales/fr/item.json';
import CuratorMetaFr from '../../locales/fr/CuratorMeta.json';
import ListOptionsDropdownFr from '../../locales/fr/ListOptionsDropdown.json';
import HeroFr from '../../locales/fr/Hero.json';
import SectionHeaderFr from '../../locales/fr/SectionHeader.json';

/**
 * Merge all modular translation files into a single namespace object.
 * Each module name becomes a top-level key in the messages object.
 *
 * Naming convention:
 *   - Lowercase files → lowercase namespace keys: common, auth, navbar, footer, etc.
 *   - PascalCase files → PascalCase namespace keys: NewList, ListCard, ListPage, etc.
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
  item: itemEn,
  forms: formsEn,
  // Page/Modal namespaces (PascalCase for useTranslations usage)
  ListPage: ListPageEn,
  NewList: NewListEn,
  EditListModal: EditListModalEn,
  // Component namespaces (PascalCase for useTranslations usage)
  AccountDropdown: AccountDropdownEn,
  ListCard: ListCardEn,
  CuratorMeta: CuratorMetaEn,
  ListOptionsDropdown: ListOptionsDropdownEn,
  Hero: HeroEn,
  SectionHeader: SectionHeaderEn,
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
  item: itemFr,
  forms: formsFr,
  // Page/Modal namespaces (PascalCase for useTranslations usage)
  ListPage: ListPageFr,
  NewList: NewListFr,
  EditListModal: EditListModalFr,
  // Component namespaces (PascalCase for useTranslations usage)
  AccountDropdown: AccountDropdownFr,
  ListCard: ListCardFr,
  CuratorMeta: CuratorMetaFr,
  ListOptionsDropdown: ListOptionsDropdownFr,
  Hero: HeroFr,
  SectionHeader: SectionHeaderFr,
};

export const messages = {
  en: messagesEn,
  fr: messagesFr,
} as const;

export default messagesEn;
