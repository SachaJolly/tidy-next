import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ListItemsSkeleton } from '@/components/Item/ListItems.skeleton';
import { ListHeaderSkeleton } from '@/components/ListHeader/ListHeader.skeleton';
import { NavbarAuthSkeleton } from '@/components/Navbar/NavbarAuth.skeleton';
import { ProfileHeaderSkeleton } from '@/components/ProfileCard/ProfileHeader.skeleton';
import { ProfileListsSkeleton } from '@/components/ProfileCard/ProfileLists.skeleton';
import { ListPageSkeleton } from '@/layouts/ListLayout/ListPage.skeleton';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

const meta = {
  title: 'Components/Skeletons',
  component: FeedPageSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    sections: {
      control: { type: 'number', min: 1, max: 5, step: 1 },
    },
    showHero: {
      control: 'boolean',
    },
  },
  args: {
    sections: 1,
    showHero: false,
  },
} satisfies Meta<typeof FeedPageSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavbarAuth: Story = {
  render: () => <NavbarAuthSkeleton />,
};

export const FeedDefault: Story = {};

export const FeedWithHero: Story = {
  args: {
    sections: 2,
    showHero: true,
  },
};

export const FeedEdgeCase: Story = {
  args: {
    sections: 5,
    showHero: true,
  },
};

export const ProfileHeader: Story = {
  render: () => <ProfileHeaderSkeleton />,
};

export const ProfileLists: Story = {
  render: () => <ProfileListsSkeleton />,
};

export const ListHeader: Story = {
  render: () => <ListHeaderSkeleton />,
};

export const ListItems: Story = {
  render: () => <ListItemsSkeleton />,
};

export const ListPage: Story = {
  render: () => <ListPageSkeleton />,
};
