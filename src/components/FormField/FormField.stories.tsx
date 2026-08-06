import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Input from '@/components/Input/Input';
import Textarea from '@/components/Textarea/Textarea';

import FormField from './FormField';

const meta = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    htmlFor: { control: 'text' },
  },
  args: {
    label: 'Display name',
    caption: 'This is the name shown publicly on your profile.',
    htmlFor: 'demo-input',
    children: <Input id="demo-input" placeholder="Your name" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCaption: Story = {
  args: {
    label: 'Username',
    caption: undefined,
    children: <Input id="username" placeholder="your-username" />,
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Bio',
    caption: 'A short description shown on your public profile. Max 160 characters.',
    htmlFor: 'bio',
    children: <Textarea id="bio" placeholder="Tell people about yourself" rows={4} />,
  },
};

export const WithInput: Story = {
  args: {
    label: 'Website',
    caption: 'Your personal or professional website URL.',
    htmlFor: 'website',
    children: <Input id="website" type="url" placeholder="https://yoursite.com" />,
  },
};
