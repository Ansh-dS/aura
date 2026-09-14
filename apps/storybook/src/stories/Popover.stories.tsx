import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover, Button, Text } from '@components'

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment of the popover relative to the trigger',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'The starting visibility state',
    },
    children: {
      table: {
        disable: true,
      },
    },
    content: {
      table: {
        disable: true,
      },
    },
  },
  // We need this decorator because the Popover is 'absolute' and 'top-full'.
  // Without padding, it will be invisible in the Storybook preview.
  decorators: [
    (Story) => (
      <div
        style={{
          paddingBottom: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  args: {
    align: 'center',
    defaultOpen: false,
    // Assuming your Button component uses 'children' for text
    children: (
      <Button
        className="cursor-pointer"
        text="Click for Info"
        variant="primary"
      ></Button>
    ),
    content: (
      <div className="flex flex-col gap-2 max-w-62.5">
        <Text as="h4" className="font-bold text-fg-primary">
          Popover Title
        </Text>
        <Text className="text-fg-secondary">
          This is a rich popover containing extra details, styled with the
          Kashmir Alpine palette.
        </Text>
      </div>
    ),
  },
}

export const InitiallyOpen: Story = {
  args: {
    ...Default.args,
    defaultOpen: true,
    children: <Button text="Already Open" variant="secondary"></Button>,
  },
}

export const RightAligned: Story = {
  args: {
    ...Default.args,
    align: 'end',
    children: <Button text="Align End" variant="outline"></Button>,
  },
}
