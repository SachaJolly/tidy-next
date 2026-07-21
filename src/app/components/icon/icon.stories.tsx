import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Icon from './icon';
import './icon.module.scss';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['search'],
    },
    size: {
      control: 'select',
      options: ['12px', '16px', '20px', '24px'],
    },
  },
  args: {
    name: 'search',
    size: '24px',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'search',
  },
  play: async ({ canvasElement }) => {
    const span = canvasElement.querySelector('span');
    await expect(span).toBeVisible();
  },
};

export const Size12: Story = {
  args: {
    name: 'search',
    size: '12px',
  },
};

export const Size16: Story = {
  args: {
    name: 'search',
    size: '16px',
  },
};

export const Size20: Story = {
  args: {
    name: 'search',
    size: '20px',
  },
};

export const Size24: Story = {
  args: {
    name: 'search',
    size: '24px',
  },
};
