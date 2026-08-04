/**
 * Central message export for next-intl with modular translations.
 *
 * This file imports all modular translation files (common, auth, navbar, etc.)
 * and merges them into a single object for both app and Storybook usage.
 *
 * Modular structure:
 *   locales/en/common.json   - Global UI strings
 *   locales/en/auth.json     - Authentication strings
 *   locales/en/navbar.json   - Navigation strings
 *   locales/en/footer.json   - Footer strings
 *   ...and more
 *
 * The merged result:
 *   {
 *     "common": {...},
 *     "auth": {...},
 *     "navbar": {...},
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
import componentsEn from '../../locales/en/components.json';

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
import componentsFr from '../../locales/fr/components.json';

/**
 * Merge all modular translation files into a single namespace object.
 * Each module name becomes a top-level key in the messages object.
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
  components: componentsEn,
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
  components: componentsFr,
};

export const messages = {
  en: messagesEn,
  fr: messagesFr,
} as const;

export default messagesEn;
