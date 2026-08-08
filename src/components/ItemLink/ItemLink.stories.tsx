import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ItemLink from './ItemLink';
import type { ItemLinkMetadata } from './ItemLink.types';
import { UserProvider } from '@/providers/UserProvider';

const baseMetadata: ItemLinkMetadata = {
  title: 'An example article title',
  description: 'A short summary of the linked page, used by the bookmark and embed layouts.',
  siteName: 'Example',
  host: 'example.com',
  favicon: 'https://example.com/favicon.ico',
  image: 'https://example.com/cover.jpg',
  author: 'Jane Doe',
  publishedTime: '2024-05-14T10:00:00.000Z',
};

const meta = {
  title: 'Components/ItemLink',
  component: ItemLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  // ItemLinkSite reads the viewer's timezone through useDateFormatter -> useUser,
  // which throws outside a provider. A guest session is enough to render the story.
  decorators: [
    (Story) => (
      <UserProvider initialUser={null}>
        <Story />
      </UserProvider>
    ),
  ],
} satisfies Meta<typeof ItemLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'link',
    metadata: baseMetadata,
  },
};

export const Bookmark: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'bookmark',
    metadata: baseMetadata,
  },
};

export const Embed: Story = {
  args: {
    url: 'https://example.com',
    displayMode: 'embed',
    metadata: {
      ...baseMetadata,
      embed:
        '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
    },
  },
};
