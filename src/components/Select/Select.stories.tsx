import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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
  render: () => {
    const [value, setValue] = useState('utc');
    return (
      <Select
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Select a timezone"
      />
    );
  },
};

const groupedOptions = [
  {
    label: 'Europe',
    options: [
      { value: 'europe/london', label: 'London' },
      { value: 'europe/paris', label: 'Paris' },
      { value: 'europe/berlin', label: 'Berlin' },
    ],
  },
  {
    label: 'America',
    options: [
      { value: 'america/new_york', label: 'New York' },
      { value: 'america/los_angeles', label: 'Los Angeles' },
      { value: 'america/chicago', label: 'Chicago' },
    ],
  },
  { value: 'utc', label: 'UTC' },
];

export const WithOptGroups: Story = {
  render: () => {
    const [value, setValue] = useState('europe/london');
    return (
      <Select
        options={groupedOptions}
        value={value}
        onChange={setValue}
        placeholder="Select a city"
      />
    );
  },
};
