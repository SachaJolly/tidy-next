import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import NewListModal from "./new-list-modal";

const messages = {
  NewList: {
    title: "Create a list",
    description: "Add a title and an optional description, then save to publish the new list.",
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

// Storybook doesn't run the app-level NextIntl provider, so we inject a tiny
// local dictionary that covers the strings used by the modal and its form.
const withIntl = (Story: React.ComponentType) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: "Components/Modals/NewListModal",
  component: NewListModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [withIntl],
} satisfies Meta<typeof NewListModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
};

export const Open: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      // The Next.js addon mocks next/navigation from these params, which makes
      // the modal open as if the URL were `?modal=new-list`.
      navigation: {
        pathname: "/dashboard",
        query: {
          modal: "new-list",
        },
      },
    },
  },
};
