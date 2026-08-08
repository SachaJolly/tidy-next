import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileHeaderSkeleton from './ProfileHeader.skeleton';

const meta = {
  title: 'Components/ProfileHeader/Skeleton',
  component: ProfileHeaderSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProfileHeaderSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
