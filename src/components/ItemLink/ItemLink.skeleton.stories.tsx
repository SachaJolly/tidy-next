import type { Meta, StoryObj } from '@storybook/react';
import ItemLinkSkeleton from './ItemLink.skeleton';

const meta = {
  title: 'Components/ItemLink/Skeleton',
  component: ItemLinkSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ItemLinkSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
