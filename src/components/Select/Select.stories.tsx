import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'utc', label: 'UTC' },
  { value: 'gmt', label: 'GMT' },
  { value: 'est', label: 'EST' },
  { value: 'pst', label: 'PST' },
  { value: 'cst', label: 'CST' },
];

export const Default: Story = {
  args: {
    options,
    placeholder: 'Select a timezone',
  },
};
