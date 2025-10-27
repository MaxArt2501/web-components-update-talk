import type { Meta, StoryObj as Story } from '@storybook/web-components-vite';

import type { DateRange } from '../scripts/date-range';
import '../scripts/date-range';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Forms/Date Range',
  tags: ['autodocs'],
  render: (args) => Object.assign(document.createElement('date-range'), args),
  argTypes: {
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    name: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  }
} satisfies Meta<DateRange>;


export default meta;

export const Base: Story = {
  args: {}
};

export const DefaultValue: Story = {
  args: {
    defaultValue: '2022-01-01/2022-12-31',
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
  }
};

export const Required: Story = {
  args: {
    required: true,
  }
};
