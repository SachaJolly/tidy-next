import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Avatar from './avatar';
import './avatar.module.scss';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    initials: { control: 'text' },
    src: { control: 'text' },
    alt: { control: 'text' },
    size: {
      control: 'select',
      options: ['24', '32', '56', '96'],
      defaultValue: '32',
    },
  },
  args: {
    initials: 'A',
    size: '32',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const avatar = canvas.getByText('A');
    await expect(avatar).toBeVisible();
  },
};

export const WithImage: Story = {
  args: {
    src: 'img/avatar-alexandra.jpeg',
    alt: 'Alexandra',
    size: '32',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <Avatar initials="A" size="24" />
      <Avatar initials="A" size="32" />
      <Avatar initials="A" size="56" />
      <Avatar initials="A" size="96" />
    </div>
  ),
};
