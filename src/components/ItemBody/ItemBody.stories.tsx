import type { Meta, StoryObj } from '@storybook/react';
import ItemBody from './ItemBody';

const meta = {
  title: 'Components/ItemBody',
  component: ItemBody,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ItemBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    body: '<p>This is <strong>markdown</strong> body content with a <a href="https://example.com">link</a>.</p><p>Second paragraph.</p>',
  },
};
