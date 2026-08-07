import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Spinner from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    size: 16,
    hidden: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: [12, 16, 20, 24],
    },
    hidden: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: 24,
  },
};

export const Hidden: Story = {
  args: {
    hidden: true,
  },
};
