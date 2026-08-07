import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/lib/messages';
import { RESPONSIVE_DEFAULT_VIEWPORT, RESPONSIVE_VIEWPORTS } from '@/stories/responsive-viewports';

import Footer from './Footer';

import './Footer.module.scss';

// Provide translations context for Footer component
const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: RESPONSIVE_VIEWPORTS,
      defaultViewport: RESPONSIVE_DEFAULT_VIEWPORT,
    },
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {},
  args: {},
  decorators: [withIntl],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const tidyText = canvas.getByText('TidyCards');
    await expect(tidyText).toBeVisible();
  },
};
