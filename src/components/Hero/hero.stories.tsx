import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { NextIntlClientProvider } from 'next-intl';
import Hero from './hero';
import messages from '@/lib/messages';
import './hero.module.scss';

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
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {},
  args: {},
  decorators: [withIntl],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const title = canvas.getByText(/Become a curator/i);
    await expect(title).toBeVisible();
  },
};
