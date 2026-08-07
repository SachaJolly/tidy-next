import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/lib/messages';
import { RESPONSIVE_DEFAULT_VIEWPORT, RESPONSIVE_VIEWPORTS } from '@/stories/responsive-viewports';

import Hero from './Hero';

import './Hero.module.scss';

// Provide translations context for Hero component
const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: RESPONSIVE_VIEWPORTS,
      defaultViewport: RESPONSIVE_DEFAULT_VIEWPORT,
    },
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['centered', 'horizontal'],
    },
  },
  args: {
    title: 'Become a curator.',
    subtitle:
      'Organize and make connections between your links! Whether articles, publications, videos, tweets or any kinds of content.',
    variant: 'centered',
  },
  decorators: [withIntl],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Horizontal: Story = {
  args: {
    variant: 'horizontal',
  },
};
