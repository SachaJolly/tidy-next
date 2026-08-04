import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';

import { Modal, ModalHeader, ModalContent, ModalFooter, ModalClose } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['small', 'default', 'large'],
      table: {
        defaultValue: { summary: '"default"' },
      },
    },
  },
  args: {
    size: 'default',
  },
  parameters: {
    layout: 'fullscreen',
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

export const Default: Story = {
  args: {},
  render: (args) => (
    <Modal key={args.size} {...args}>
      <ModalHeader>
        <h2>Default Modal</h2>
        <ModalClose />
      </ModalHeader>
      <ModalContent>
        <p style={{ color: 'var(--text-muted, #666)' }}>
          This is a simple default modal example. You can use it to display alerts, confirmations,
          or any generic content.
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
