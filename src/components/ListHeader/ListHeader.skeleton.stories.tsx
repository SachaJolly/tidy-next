import type { Meta, StoryObj } from '@storybook/react';

import { ListHeaderSkeleton } from './ListHeader.skeleton';

const meta: Meta = {
  title: 'Components/ListHeader/Skeleton',
  component: ListHeaderSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <ListHeaderSkeleton />,
};

export const InContainer: Story = {
  render: () => (
    <div style={{ maxWidth: '800px', padding: '2rem', border: '1px solid var(--border)' }}>
      <ListHeaderSkeleton />
    </div>
  ),
};
