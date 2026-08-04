import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';

import NewListModal from './NewListModal';

// Import centralized messages to avoid duplication
import messages from '@/lib/messages';

// Storybook doesn't run the app-level NextIntl provider, so we inject the
// centralized message dictionary that covers all strings used by the modal and its form.
const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: 'Components/Modals/NewListModal',
  component: NewListModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [withIntl],
  render: () => (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '2rem',
        background: 'var(--bg-app)',
      }}
    >
      <div id="application-overlays" />
      <NewListModal />
    </div>
  ),
} satisfies Meta<typeof NewListModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      // The Next.js addon mocks next/navigation from these params, which makes
      // the modal open as if the URL were `?modal=new-list`.
      navigation: {
        pathname: '/dashboard',
        query: {
          modal: 'new-list',
        },
      },
    },
  },
};
