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
// Import translations from centralized export to avoid duplication
import messages from '../src/lib/messages';

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

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
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
