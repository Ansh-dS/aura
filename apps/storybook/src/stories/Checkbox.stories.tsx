import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from '@components'
import { ThemeProvider } from '../../../server/hooks/useTheme'

const meta: Meta<typeof Checkbox> = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'glass'],
      description: 'The visual style variant of the checkbox',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Color theme for the active state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the checkbox',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state',
    },
    label: {
      control: 'text',
      description: 'Text label accompanying the checkbox',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-8 bg-surface-base rounded-lg border border-border-default flex flex-col items-start gap-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: 'Accept Terms and Conditions',
    variant: 'solid',
    color: 'primary',
    size: 'md',
  },
}

export const CheckedByDefault: Story = {
  args: {
    label: 'Notifications enabled',
    variant: 'solid',
    color: 'primary',
    defaultChecked: true,
  },
}

export const Glass: Story = {
  args: {
    label: 'Glass Variant Checkbox',
    variant: 'glass',
    color: 'primary',
    defaultChecked: true,
  },
  decorators: [
    (Story) => (
      <div className="p-8 -m-8 bg-gradient-to-br from-action-primary/40 to-action-secondary/40 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

export const SecondaryColor: Story = {
  args: {
    label: 'Secondary Action Color',
    variant: 'solid',
    color: 'secondary',
    defaultChecked: true,
  },
}

export const SmallSize: Story = {
  args: {
    label: 'Small Checkbox (sm)',
    size: 'sm',
    defaultChecked: true,
  },
}

export const WithoutLabel: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Unchecked',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled Checked',
    disabled: true,
    defaultChecked: true,
  },
}
