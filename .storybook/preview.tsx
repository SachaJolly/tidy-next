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
  Common: {
    curatedBy: 'Curated by',
  },
  CuratorMeta: {
    lists: 'Lists',
    curatedBy: 'Curated by',
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
