import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/lib/messages';
import type { User } from '@/lib/types';
import { UserProvider } from '@/providers/UserProvider';
import { RESPONSIVE_DEFAULT_VIEWPORT, RESPONSIVE_VIEWPORTS } from '@/stories/responsive-viewports';

import Navbar from './Navbar';

const MOCK_USER: User = {
  id: '1',
  email: 'alexandra@email.com',
  name: 'Alexandra',
  username: 'alexandra',
  bio: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

type NavbarStoryArgs = {
  authenticated: boolean;
  name: string;
  username: string;
  email: string;
  avatar: string;
};

const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
    viewport: {
      options: RESPONSIVE_VIEWPORTS,
      defaultViewport: RESPONSIVE_DEFAULT_VIEWPORT,
    },
  },
  args: {
    authenticated: false,
    name: MOCK_USER.name,
    username: MOCK_USER.username,
    email: MOCK_USER.email,
    avatar: '',
  },
  argTypes: {
    authenticated: { control: 'boolean' },
    name: { control: 'text' },
    username: { control: 'text' },
    email: { control: 'text' },
    avatar: { control: 'text' },
  },
  decorators: [withIntl],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function renderNavbar(args: NavbarStoryArgs) {
  const user: User | null = args.authenticated
    ? {
        ...MOCK_USER,
        name: args.name,
        username: args.username,
        email: args.email,
        avatar: args.avatar || null,
      }
    : null;
  const storyKey = `${args.authenticated}-${args.name}-${args.username}-${args.email}-${args.avatar}`;

  return (
    <UserProvider key={storyKey} initialUser={user}>
      <Navbar />
    </UserProvider>
  );
}

export const Guest: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/discover',
      },
    },
  },
  args: {
    authenticated: false,
  },
  render: (args) => renderNavbar(args as NavbarStoryArgs),
};

export const Authenticated: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
  args: {
    authenticated: true,
  },
  render: (args) => renderNavbar(args as NavbarStoryArgs),
};
