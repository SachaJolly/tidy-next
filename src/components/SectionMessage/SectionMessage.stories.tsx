import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SectionMessage from './SectionMessage';

const meta = {
  title: 'Components/SectionMessage',
  component: SectionMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: 'Section message',
    description: 'This is a contextual message shown inside a section.',
    variant: 'information',
  },
} satisfies Meta<typeof SectionMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Information: Story = {};

export const WarningWithAction: Story = {
  args: {
    variant: 'warning',
    title: 'Profile visibility limited',
    description: 'Your profile is hidden until email confirmation.',
    actions: [{ label: 'Open account settings', href: '/settings/account' }],
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Save failed',
    description: 'Something went wrong while saving your settings.',
  },
};
