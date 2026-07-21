import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Footer from './footer';
import './footer.module.scss';

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const tidyText = canvas.getByText('TidyCards');
    await expect(tidyText).toBeVisible();
  },
};
