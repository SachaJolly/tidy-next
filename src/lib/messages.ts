/**
 * Central message export for next-intl
 * This re-exports the JSON messages for use in both app and Storybook
 */
import messagesEn from '../../locales/en.json';

export const messages = {
  en: messagesEn,
} as const;

export default messagesEn;
