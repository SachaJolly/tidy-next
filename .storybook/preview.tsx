import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/primitives.css';
import '../src/app/semantics.css';
import '../src/app/globals.css';
import './storybook.css';
import MockDate from 'mockdate';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { mswHandlers } from './msw-handlers';
import { theme } from './theme';

const serviceWorkerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`;
initialize({ onUnhandledRequest: 'bypass', serviceWorker: { url: serviceWorkerUrl } });

const preview: Preview = {
  decorators: [],
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
