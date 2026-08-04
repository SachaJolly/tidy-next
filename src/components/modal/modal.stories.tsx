import type { Meta, StoryObj } from "@storybook/react";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalClose } from "./modal";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import React, { useState } from "react";
import ButtonGroup from "@/components/button-group/button-group";
import { Logo } from "@/components/logo/logo";

const meta: Meta<typeof Modal> = {
  title: "Overlays/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["small", "default", "large"],
      table: {
        defaultValue: { summary: '"default"' },
      },
    },
  },
  args: {
    size: "default",
  },
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
    docs: {
      story: {
        inline: false,
        iframeHeight: 600,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Simulates a network call for Storybook demos.
const mockAuth = (values: any) =>
  new Promise<{ message: string }>((resolve, reject) => {
    setTimeout(() => {
      values.password === 'password'
        ? resolve({ message: 'Authentication successful!' })
        : reject({ message: "Invalid credentials. Try 'password'." });
    }, 1500);
  });

export const Default: Story = {
  args: {},
  render: (args) => (
    <Modal key={args.size} {...args}>
      <ModalHeader>
        <h2>Default Modal</h2>
        <ModalClose />
      </ModalHeader>
      <ModalContent>
        <p style={{ color: "var(--text-muted, #666)" }}>
          This is a simple default modal example. You can use it to display alerts, confirmations, or any generic content.
        </p>
      </ModalContent>
      <ModalFooter>
        <ButtonGroup className="ml-auto">
          <Button transparent={true}>Cancel</Button>
          <Button variant="interactive">Confirm</Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  ),
};

