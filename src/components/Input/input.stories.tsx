import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Input from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'date', 'datetime-local', 'number'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    id: 'input',
    type: 'text',
    placeholder: 'Placeholder',
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    id: 'name-input',
    type: 'text',
    placeholder: 'John Doe',
    disabled: false,
  },
};

export const Email: Story = {
  args: {
    label: 'Email Address',
    id: 'email-input',
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    id: 'password-input',
    type: 'password',
    placeholder: '••••••••',
  },
};

export const Telephone: Story = {
  args: {
    label: 'Phone Number',
    id: 'tel-input',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
  },
};

export const Date: Story = {
  args: {
    label: 'Birth Date',
    id: 'date-input',
    type: 'date',
  },
};

export const DateTime: Story = {
  name: 'Date and Time',
  args: {
    label: 'Publishing Time',
    id: 'datetime-input',
    type: 'datetime-local',
  },
};

export const Number: Story = {
  args: {
    label: 'Quantity',
    id: 'number-input',
    type: 'number',
    placeholder: '42',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    id: 'disabled-input',
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    id: 'no-label-input',
    type: 'text',
    placeholder: 'Search...',
    'aria-label': 'Search input',
  },
};
