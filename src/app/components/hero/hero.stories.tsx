import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Hero from './hero';
import './hero.module.scss';

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const title = canvas.getByText(/Become a curator/i);
    await expect(title).toBeVisible();
  },
};
