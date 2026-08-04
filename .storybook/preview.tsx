import type { Preview } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/primitives.css';
import '@/styles/semantics.css';
import '@/styles/globals.css';
import './storybook.css';
import MockDate from 'mockdate';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { mswHandlers } from './msw-handlers';
import { theme } from './theme';

const serviceWorkerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`;
initialize({ onUnhandledRequest: 'bypass', serviceWorker: { url: serviceWorkerUrl } });

function ApplicationOverlaysRoot() {
  useEffect(() => {
    if (document.getElementById('application-overlays')) {
      return;
    }

    const portalRoot = document.createElement('div');
    portalRoot.id = 'application-overlays';
    document.body.appendChild(portalRoot);
  }, []);

  return null;
}

// Default message bundle for components that use useTranslations().
// Extend this as needed for additional namespaces and languages.
const defaultMessages = {
  Common: {
    seeMore: 'See more',
    verifiedUser: 'Verified user',
    curatedBy: 'Curated by',
    noItemsYet: 'No items in this list yet.',
    updated: 'Updated {date}',
    items: '{count, plural, =0 {Empty} =1 {1 item} other {# items}}',
    publicLists: '{count, plural, =0 {No public lists} =1 {1 public list} other {# public lists}}',
    english: 'English',
    german: 'German - Deutsch',
    french: 'French - Français',
    russian: 'Russian - Русский',
    spanish: 'Spanish - Español',
    system: 'System',
    dark: 'Dark',
    light: 'Light',
    edit: 'Edit',
    archive: 'Archive list',
    report: 'Report',
    copyLink: 'Copy link',
    copyTo: 'Copy to...',
    moveTo: 'Move to...',
    manageCollaborators: 'Manage collaborators',
    setVisibility: 'Set visibility',
    updateVisibilityError: 'Visibility update failed. Please try again.',
    visibility: {
      publicLabel: 'Public',
      publicCaption: 'Anyone can see',
      unindexedLabel: 'Unindexed',
      unindexedCaption: 'Only people with the link can see',
      privateLabel: 'Private',
      privateCaption: 'Only you can see',
    },
  },
  ListCard: {
    pinned: 'Pinned',
    private: 'Private',
    unindexed: 'Unindexed',
    trending: 'Trending',
    popular: 'Popular',
    featured: 'Featured',
    item: '{count, plural, one {# item} other {# items}}',
    empty: 'Empty',
    note: '{count, plural, one {# note} other {# notes}}',
  },
  ListPage: {
    settings: 'Settings',
    updated: 'Updated {date}',
  },
  CuratorMeta: {
    lists: 'Lists',
    curatedBy: 'Curated by',
  },
  ListOptionsDropdown: {
    manageCollaboratorsPlaceholder: 'Collaborator management will be added here soon.',
  },
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={defaultMessages}>
        <>
          <ApplicationOverlaysRoot />
          <Story />
        </>
      </NextIntlClientProvider>
    ),
  ],
  loaders: [mswLoader],
  parameters: {
    nextjs: {
      appDirectory: true,
      // Mock the Next.js App Router for components using useRouter(), useSearchParams(), etc.
      // This allows Client Components to work properly in Storybook without the actual router.
      navigation: {
        pathname: '/',
        query: {},
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: { handlers: mswHandlers },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['Design Tokens', ['Primitives', 'Semantics'], 'Components', '*'],
      },
    },
    docs: { theme },
  },
  async beforeEach() {
    MockDate.set('2024-04-01T12:00:00Z');
  },
};

export default preview;
