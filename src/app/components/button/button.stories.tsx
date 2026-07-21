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
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: [undefined, 'search'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    type: {
      control: 'select',
      options: ['default', 'interactive'],
    },
    tinted: { control: 'boolean' },
    transparent: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    size: 'default',
    type: 'default',
    tinted: false,
    transparent: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: /label/i });
    await expect(button).toBeVisible();
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Transparent: Story = {
  args: {
    transparent: true,
  },
};

export const Interactive: Story = {
  args: {
    type: 'interactive',
  },
};

export const Tinted: Story = {
  args: {
    type: 'interactive',
    tinted: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Like',
    icon: 'favorite',
  },
};

export const CssCheck: Story = {
  args: {
    label: 'Check Style',
    type: 'default',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: /check style/i });
    const styles = window.getComputedStyle(button);
    await expect(styles.display).toBeTruthy();
  },
};
