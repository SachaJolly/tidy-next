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
    variant: { control: 'radio', options: ['success', 'danger'] },
    feedback: { control: 'text' },
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

export const Success: Story = {
  args: {
    variant: 'success',
    feedback: 'This username is available.',
    defaultValue: 'alexandra',
  },
  render: (args) => (
    <FormField label="Username" htmlFor="success-input">
      <Input {...args} id="success-input" />
    </FormField>
  ),
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    feedback: 'This email is already taken.',
    defaultValue: 'taken@example.com',
  },
  render: (args) => (
    <FormField label="Email" htmlFor="danger-input">
      <Input {...args} id="danger-input" type="email" />
    </FormField>
  ),
};

export const WithPrefix: Story = {
  render: (args) => (
    <FormField label="Website" htmlFor="website-input">
      <Input {...args} id="website-input" type="text" placeholder="yoursite.com" prefix="https://" />
    </FormField>
  ),
};

export const WithSuffix: Story = {
  render: (args) => (
    <FormField label="Username" htmlFor="username-input">
      <Input {...args} id="username-input" type="text" placeholder="yourname" suffix="@tidycards.app" />
    </FormField>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: (args) => (
    <FormField label="Price" htmlFor="price-input">
      <Input {...args} id="price-input" type="number" placeholder="0.00" prefix="€" suffix="per month" />
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
