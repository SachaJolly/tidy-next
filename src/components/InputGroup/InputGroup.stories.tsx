import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import FormField from '@/components/FormField/FormField';

import InputGroup from './InputGroup';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    children: null,
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup>
      <Input id="demo" placeholder="Enter a value…" />
      <Button type="button" variant="interactive">Save</Button>
    </InputGroup>
  ),
};

export const EmailWithSave: Story = {
  render: () => {
    const [email, setEmail] = useState('user@example.com');
    return (
      <FormField label="Email address" caption="Your login email." htmlFor="email-group">
        <InputGroup>
          <Input id="email-group" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="button" variant="interactive">Save email</Button>
        </InputGroup>
      </FormField>
    );
  },
};

export const UsernameWithSave: Story = {
  render: () => {
    const [username, setUsername] = useState('alex');
    return (
      <FormField label="Username" caption="Your unique public handle." htmlFor="username-group">
        <InputGroup>
          <Input id="username-group" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your-username" />
          <Button type="button" variant="interactive">Save username</Button>
        </InputGroup>
      </FormField>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <InputGroup>
      <Input id="disabled-group" value="cannot-edit" disabled />
      <Button type="button" variant="interactive" disabled>Save</Button>
    </InputGroup>
  ),
};
