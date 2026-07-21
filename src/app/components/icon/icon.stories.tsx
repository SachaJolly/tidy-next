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
      options: [
        'heart',
        'star',
        'favorite',
        'check',
        'close',
        'chevronDown',
        'chevronUp',
        'chevronLeft',
        'chevronRight',
        'arrow',
        'arrowUp',
        'arrowDown',
        'search',
        'menu',
        'settings',
        'success',
        'error',
        'warning',
        'info',
      ],
    },
    size: {
      control: 'select',
      options: ['12px', '16px', '20px', '24px'],
    },
  },
  args: {
    name: 'favorite',
    size: '24px',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'favorite',
  },
  play: async ({ canvasElement }) => {
    const span = canvasElement.querySelector('span');
    await expect(span).toBeVisible();
  },
};

export const Heart: Story = {
  args: {
    name: 'heart',
  },
};

export const Star: Story = {
  args: {
    name: 'star',
  },
};

export const Arrow: Story = {
  args: {
    name: 'arrow',
  },
};

export const Check: Story = {
  args: {
    name: 'check',
  },
};

export const ChevronDown: Story = {
  args: {
    name: 'chevronDown',
  },
};

export const Size12: Story = {
  args: {
    name: 'heart',
    size: '12px',
  },
};

export const Size16: Story = {
  args: {
    name: 'star',
    size: '16px',
  },
};

export const Size20: Story = {
  args: {
    name: 'arrow',
    size: '20px',
  },
};

export const Size24: Story = {
  args: {
    name: 'check',
    size: '24px',
  },
};
