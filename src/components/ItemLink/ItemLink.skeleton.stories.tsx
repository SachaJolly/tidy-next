import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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

export const Loading: Story = {
  args: {
    loading: true,
  },
};
