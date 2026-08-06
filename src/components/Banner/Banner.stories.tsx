import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Banner from './Banner';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: 'Heads up',
    children: 'This is an important message for the current user.',
    variant: 'warning',
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {};

export const Danger: Story = {
  args: {
    title: 'Action required',
    children: 'This action cannot be undone.',
    variant: 'danger',
  },
};

export const Announcement: Story = {
  args: {
    title: 'New feature',
    children: 'You can now customize your profile visibility in settings.',
    variant: 'announcement',
  },
};
