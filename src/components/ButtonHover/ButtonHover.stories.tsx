import type { Meta, StoryObj } from '@storybook/react';

import { ButtonHover } from './ButtonHover';

const meta: Meta<typeof ButtonHover> = {
  title: 'Components/ButtonHover',
  component: ButtonHover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ButtonHover>;

/* ── Default — single row with dropdown ─────────────────────────────────── */

export const Default: Story = {
  args: {
  },
};

export const Label: Story = {
  args: {
    label: "Label"
  },
}

