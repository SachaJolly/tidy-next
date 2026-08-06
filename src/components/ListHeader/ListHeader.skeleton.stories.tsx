import type { Meta, StoryObj } from '@storybook/react';

import { ListHeaderSkeleton } from './ListHeader.skeleton';

const meta: Meta = {
  title: 'Components/ListHeader/Skeleton',
  component: ListHeaderSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: [],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <ListHeaderSkeleton />,
};
