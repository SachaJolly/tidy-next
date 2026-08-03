import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import Button from "@/components/button/button";
import { Dropdown } from "@/components/dropdown";
import ListOptionsDropdown from "./list-options-dropdown";

const messages = {
  Common: {
    curatedBy: "Curated by",
  },
  ListPage: {
    updated: "Updated {date}",
    settings: "Settings",
  },
  ListOptionsDropdown: {
    edit: "Edit",
    manageCollaborators: "Manage collaborators",
    manageCollaboratorsPlaceholder: "Collaborator management will be added here soon.",
    archiveList: "Archive list",
    setVisibility: "Set visibility",
    updateVisibilityError: "Visibility update failed. Please try again.",
    publicLabel: "Public",
    publicCaption: "Anyone can see",
    unindexedLabel: "Unindexed",
    unindexedCaption: "Only people with the link can see",
    privateLabel: "Private",
    privateCaption: "Only you can see",
    copyLink: "Copy link",
  },
  EditListModal: {
    trigger: "Edit",
    title: "Edit list",
    description: "Update the title and description, then save your changes.",
    save: "Save changes",
  },
  ListForm: {
    createList: "Create list",
    cancel: "Cancel",
    saving: "Saving...",
    titleLabel: "Title",
    descriptionLabel: "Description",
    titlePlaceholder: "My reading list",
    descriptionPlaceholder: "Tell people what this list is about",
    titleRequired: "Please enter a list title.",
    didNotReturnList: "The server did not return a list.",
    creationFailed: "List creation failed.",
  },
};

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
  initialVisibility: "PUBLIC" as const,
  listTitle: "A curated list",
  listDescription: "A storybook-friendly list",
  authorName: "Alexandra",
  updatedAt: "2024-04-01T12:00:00.000Z",
};

const renderOpenMenu = (args: typeof listArgs) => (
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
