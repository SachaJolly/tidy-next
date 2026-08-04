import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import Button from "@/components/button/button";
import { Dropdown } from "@/components/dropdown";
import ListOptionsDropdown from "./list-options-dropdown";
// Import translations from centralized export to avoid duplication
import messages from "@/lib/messages";

// This provider keeps the dropdown and modal copy localized in Storybook
// without depending on the app router-level NextIntl setup.
const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: "Components/Lists/ListOptionsDropdown",
  component: ListOptionsDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [withIntl],
} satisfies Meta<typeof ListOptionsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const listArgs = {
  listId: "list-1",
  isAuthor: true,
  initialVisibility: "PUBLIC",
  listTitle: "A curated list",
  listDescription: "A storybook-friendly list",
  authorName: "Alexandra",
  updatedAt: "2024-04-01T12:00:00.000Z",
} as const;

const renderOpenMenu = (args: any) => (
  <Dropdown open={true}>
    <Button icon="settings" aria-label="Settings" size="small" tinted={true} />
    <ListOptionsDropdown {...args} inline={true} />
  </Dropdown>
);

export const AuthorMenuOpen: Story = {
  args: listArgs,
  render: renderOpenMenu,
  parameters: {
    nextjs: {
      appDirectory: true,
      // The router mock uses this query string to simulate an open edit modal.
      navigation: {
        pathname: "/lists/list-1",
        query: {
          modal: "edit-list",
          modalId: "list-1",
        },
      },
    },
  },
};

export const CollaboratorsOpen: Story = {
  args: listArgs,
  render: renderOpenMenu,
  parameters: {
    nextjs: {
      appDirectory: true,
      // Same hook, different modal name and the same list-scoped id.
      navigation: {
        pathname: "/lists/list-1",
        query: {
          modal: "manage-collaborators",
          modalId: "list-1",
        },
      },
    },
  },
};

export const ReaderMenu: Story = {
  args: {
    ...listArgs,
    isAuthor: false,
  },
  render: renderOpenMenu,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/lists/list-1",
      },
    },
  },
};
