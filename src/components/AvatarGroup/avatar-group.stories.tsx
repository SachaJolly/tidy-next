import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import AvatarGroup from './avatar-group';
import './avatar-group.module.scss';

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    size: { control: 'select', options: ['24', '32', '56', '96'] },
    max: { control: 'number' },
  },
  args: {
    avatars: [
      {
        src: 'img/avatar-alexandra.jpeg',
        alt: 'Alexandra',
        initials: 'A',
      },
      {
        src: 'img/avatar-alexandra.jpeg',
        alt: 'Alexandra',
        initials: 'A',
      },
      {
        src: 'img/avatar-alexandra.jpeg',
        alt: 'Alexandra',
        initials: 'A',
      },
    ],
    size: '24',
    max: 3,
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('[class*="avatar"]');
    await expect(avatars.length).toBeGreaterThan(0);
  },
};

export const Size32: Story = {
  args: {
    size: '32',
  },
};

export const Size56: Story = {
  args: {
    size: '56',
  },
};

export const Size96: Story = {
  args: {
    size: '96',
  },
};
