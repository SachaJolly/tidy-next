import type { Preview } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
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

const preview: Preview = {
  decorators: [
    (Story) => (
      <>
        <ApplicationOverlaysRoot />
        <Story />
      </>
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
