import type { StorybookConfig } from '@storybook/nextjs-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  async viteFinal(config): Promise<InlineConfig> {
    const base = process.env.STORYBOOK_BASE_URL ? `${process.env.STORYBOOK_BASE_URL}/` : '/';
    return {
      ...config,
      base,
      css: {
        transformer: 'postcss',
      },
    };
  },
};
export default config;