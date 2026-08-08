import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ItemLinkSkeleton from './ItemLink.skeleton';

const meta = {
  title: 'Components/ItemLink/Skeleton',
  component: ItemLinkSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    displayMode: 'link',
  },
} satisfies Meta<typeof ItemLinkSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: {
    displayMode: 'link',
  },
};

export const Bookmark: Story = {
  args: {
    displayMode: 'bookmark',
  },
};

export const Embed: Story = {
  args: {
    displayMode: 'embed',
  },
};
