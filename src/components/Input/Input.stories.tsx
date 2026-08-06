import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormField from '@/components/FormField/FormField';
import Input from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
  render: (args) => (
    <FormField label="Full Name" htmlFor="name-input">
      <Input {...args} id="name-input" placeholder="John Doe" />
    </FormField>
  ),
};

export const Email: Story = {
  render: (args) => (
    <FormField label="Email Address" htmlFor="email-input">
      <Input {...args} id="email-input" type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Password: Story = {
  render: (args) => (
    <FormField label="Password" htmlFor="password-input">
      <Input {...args} id="password-input" type="password" placeholder="••••••••" />
    </FormField>
  ),
};

export const Telephone: Story = {
  render: (args) => (
    <FormField label="Phone Number" htmlFor="tel-input">
      <Input {...args} id="tel-input" type="tel" placeholder="+1 (555) 123-4567" />
    </FormField>
  ),
};

export const Date: Story = {
  render: (args) => (
    <FormField label="Birth Date" htmlFor="date-input">
      <Input {...args} id="date-input" type="date" />
    </FormField>
  ),
};

export const DateTime: Story = {
  name: 'Date and Time',
  render: (args) => (
    <FormField label="Publishing Time" htmlFor="datetime-input">
      <Input {...args} id="datetime-input" type="datetime-local" />
    </FormField>
  ),
};

export const Number: Story = {
  render: (args) => (
    <FormField label="Quantity" htmlFor="number-input">
      <Input {...args} id="number-input" type="number" placeholder="42" />
    </FormField>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <FormField label="Disabled Input" htmlFor="disabled-input">
      <Input {...args} id="disabled-input" disabled />
    </FormField>
  ),
};

export const WithoutLabel: Story = {
  args: {
    id: 'no-label-input',
    type: 'text',
    placeholder: 'Search...',
    'aria-label': 'Search input',
  },
};
