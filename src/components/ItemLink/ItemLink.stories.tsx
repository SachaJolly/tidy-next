import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ItemLink from './ItemLink';

const meta = {
  title: 'Components/ItemLink',
  component: ItemLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ItemLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'link',
  },
};

export const Bookmark: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'bookmark',
  },
};

export const Embed: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'embed',
  },
};
