import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SettingsSidebar from './SettingsSidebar';

const meta = {
  title: 'Layouts/SettingsSidebar',
  component: SettingsSidebar,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SettingsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/settings/profile',
      },
    },
  },
};

export const PreferencesActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/settings/preferences',
      },
    },
  },
};

export const AccountActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/settings/account/security',
      },
    },
  },
};
