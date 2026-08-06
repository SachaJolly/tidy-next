import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Textarea from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: {
    id: 'textarea',
    placeholder: 'Placeholder',
    disabled: false,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Bio',
    id: 'bio-textarea',
    placeholder: 'Tell people about yourself',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Bio',
    id: 'bio-value',
    defaultValue: "I'm a designer and developer based in Paris. I love open source and building useful tools.",
  },
};

export const Tall: Story = {
  args: {
    label: 'Description',
    id: 'description-tall',
    placeholder: 'Write a longer description…',
    rows: 8,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    id: 'disabled-textarea',
    defaultValue: 'This field cannot be edited.',
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    id: 'no-label',
    placeholder: 'Write something…',
    'aria-label': 'Content',
  },
};
