import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import ListCard from './list-card';
import './list-card.module.scss';

const mockList = {
  id: '5a6f3d78b5df6d00042ceeb1',
  title: 'Vidastes incontournables',
  description:
    'Voici une liste non exhaustive des vidastes qui font un travail gnial et de qualit. Mais cela ne reste que mon humble avis.',
  status: 'ACTIVE' as const,
  visibility: 'PUBLIC' as const,
  displayMode: 'LIST' as const,
  color: 'FF887A',
  thumbnail: '5ca7a2cfd0e7b90004198839',
  items: 0,
  collaborators: 0,
  notes: 0,
  isOnDiscover: true,
  isFeatured: false,
  authorId: '584348bf79a3c400042a5940',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

const meta = {
  title: 'Components/ListCard',
  component: ListCard,
  parameters: {
    layout: 'centered',
  },
  docs: {
    controls: { sort: 'requiredFirst' },
  },
  tags: ['ai-generated', 'autodocs'],
  argTypes: {
    bigger: { control: 'boolean' },
  },
  args: {
    list: mockList,
  },
} satisfies Meta<typeof ListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const title = canvas.getByText(/Vidastes incontournables/i);
    await expect(title).toBeVisible();
  },
};

export const Items: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
    },
  },
};

export const Notes: Story = {
  args: {
    list: {
      ...mockList,
      notes: 5,
    },
  },
};

export const Thumbnail: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
    },
  },
};

export const Pinned: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      isFeatured: true,
      visibility: 'PRIVATE',
    },
  },
};

export const Private: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      isFeatured: true,
      visibility: 'PRIVATE',
    },
  },
};

export const Unindexed: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      isFeatured: true,
      visibility: 'UNINDEXED',
    },
  },
};

export const Featured: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      visibility: 'PUBLIC',
      isFeatured: true,
    },
  },
};

export const Popular: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      visibility: 'PUBLIC',
      isPopular: true,
    } as any,
  },
};

export const Trending: Story = {
  args: {
    list: {
      ...mockList,
      items: 67,
      notes: 1,
      thumbnail: '5ca7a2cfd0e7b90004198839',
      visibility: 'PUBLIC',
      isTrending: true,
    } as any,
  },
};
