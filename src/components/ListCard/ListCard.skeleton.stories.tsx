import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ListCardSkeleton from './ListCard.skeleton';

const meta = {
  title: 'Components/ListCardSkeleton',
  component: ListCardSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ListCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
