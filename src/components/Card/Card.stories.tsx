import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Card from './Card';

import './Card.module.scss';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'Card title',
    description: 'A short description of what this card is about.',
    children: <p style={{ margin: 0 }}>Card body content goes here.</p>,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
  },
};

export const WithFormContent: Story = {
  args: {
    title: 'Email address',
    description: 'Your login email. You will need to re-confirm if you change it.',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          defaultValue="user@example.com"
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}
        />
        <button type="button" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem' }}>
          Save email
        </button>
      </div>
    ),
  },
};

export const Stacked: Story = {
  render: () => (
    <div>
      <Card title="Public profile" description="Your name, bio, and avatar as seen by other users.">
        <p style={{ margin: 0 }}>Profile fields…</p>
      </Card>
      <Card title="Links" description="Your website and social handles shown on your public profile.">
        <p style={{ margin: 0 }}>Link fields…</p>
      </Card>
      <Card title="Danger zone">
        <p style={{ margin: 0 }}>Destructive actions…</p>
      </Card>
    </div>
  ),
};
