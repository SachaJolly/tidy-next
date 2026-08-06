import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ChoiceInput from './ChoiceInput';

const meta = {
  title: 'Components/ChoiceInput',
  component: ChoiceInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    id: 'choice-input',
    name: 'choice-input',
    checked: false,
    onChange: () => undefined,
  },
} satisfies Meta<typeof ChoiceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checkbox: Story = {
  args: {
    type: 'checkbox',
    label: 'Enable email notifications',
    caption: 'Get updates about your account activity.',
  },
};

export const Radio: Story = {
  args: {
    type: 'radio',
    name: 'privacy',
    label: 'Private profile',
    caption: 'Only you can see your profile page.',
  },
};
