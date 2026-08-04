import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Button from './button';
import './button.module.scss';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' }, // Added label to controls
    icon: {
      control: 'select',
      options: [undefined, 'search', 'favorite'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    variant: {
      control: 'select',
      options: ['default', 'interactive'],
    },
    tinted: { control: 'boolean' },
    transparent: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Button Label', // Use label as the default for stories
    size: 'default',
    variant: 'default',
    tinted: false,
    transparent: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories for the Link version (<a />) ---

export const Link: Story = {
  name: 'As a Link (using label)',
  args: {
    href: '#',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: /button label/i });
    await expect(button).toBeVisible();
  },
};

export const LinkWithChildren: Story = {
  name: 'As a Link (using children)',
  args: {
    href: '#',
    label: 'This is ignored', // To demonstrate that children takes priority
    children: <span>Click <strong>Me</strong></span>,
  },
};

// --- Stories for the Button version (<button />) ---

export const AsButton: Story = {
  name: 'As a Button',
  args: {
    // No href prop makes it a <button>
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button label/i });
    await expect(button).toBeVisible();
  },
};

export const AsButtonSubmit: Story = {
  name: 'As a Button (Submit)',
  args: {
    variant: 'interactive',
    type: 'submit',
    label: 'Submit Form',
  },
};

export const AsButtonDisabled: Story = {
  name: 'As a Button (Disabled)',
  args: {
    variant: 'interactive',
    disabled: true,
    label: 'Cannot Click',
  },
};
