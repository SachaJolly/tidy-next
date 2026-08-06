import type { Meta, StoryObj } from '@storybook/react';
import { ItemSkeleton } from './Item.skeleton';

const meta = {
  title: 'Components/Item/Skeleton',
  component: ItemSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ItemSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default skeleton state
 */
export const Default: Story = {};

/**
 * Skeleton in container context (with border)
 */
export const InContainer: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div style={{ maxWidth: '600px', padding: '1rem' }}>
      <ItemSkeleton />
    </div>
  ),
};

/**
 * Multiple skeletons stacked (simulating list loading state)
 */
export const MultipleSkeletons: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div style={{ maxWidth: '600px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ItemSkeleton />
      <ItemSkeleton />
      <ItemSkeleton />
    </div>
  ),
};
