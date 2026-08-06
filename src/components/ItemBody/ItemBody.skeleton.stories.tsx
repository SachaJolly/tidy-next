import type { Meta, StoryObj } from '@storybook/react';
import ItemBodySkeleton from './ItemBody.skeleton';

const meta = {
  title: 'Components/ItemBody/Skeleton',
  component: ItemBodySkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ItemBodySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
