import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/primitives.css';
import '../src/app/themes.css';
import '../src/app/globals.css';
import MockDate from 'mockdate';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { mswHandlers } from './msw-handlers';

initialize({ onUnhandledRequest: 'bypass' });

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
  },
  async beforeEach() {
    MockDate.set('2024-04-01T12:00:00Z');
  },
};

export default preview;