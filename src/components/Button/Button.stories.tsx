import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { icons, type IconName } from '@/components/Icon/icons';

import Button from './Button';

import './Button.module.scss';

const DemoRow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
    {children}
  </div>
);

const iconOptions = [undefined, ...Object.keys(icons)] as Array<IconName | undefined>;

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
    variant: 'default',
    size: 'default',
    tinted: false,
    transparent: false,
  },
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['default', 'interactive'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    tinted: {
      control: 'boolean',
      defaultValue: false,
    },
    transparent: {
      control: 'boolean',
      defaultValue: false,
    },
    icon: {
      control: 'select',
      options: iconOptions,
    },
    hasDropdown: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Types: Story = {
  render: () => (
    <DemoRow>
      <Button label="<button>" />
      <Button href="#" label="<a> Link" />
    </DemoRow>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DemoRow>
      <Button href="#" label="Default" />
      <Button href="#" label="Small" size="small" />
    </DemoRow>
  ),
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    label: 'Interactive',
  },
};

export const Tinted: Story = {
  args: {
    variant: 'interactive',
    label: 'Tinted',
    tinted: true,
  },
};

export const Transparent: Story = {
  args: {
    label: 'Transparent',
    transparent: true,
  },
};

export const WithIcon: Story = {
  args: {
    icon: 'search',
    label: 'Icon',
  },
};

export const WithDropdownIcon: Story = {
  args: {
    icon: 'search',
    label: 'Dropdown',
    hasDropdown: true,
  },
};
