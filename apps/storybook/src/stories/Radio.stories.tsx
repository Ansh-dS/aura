import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio } from '@components'
import { ThemeProvider } from '../../../server/hooks/useTheme'

const meta: Meta<typeof Radio> = {
  title: 'Inputs/Radio',
  component: Radio,
  tags: ['autodocs'],
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

type Story = StoryObj<typeof Radio>

export const Default: Story = {
  args: {
    label: 'Solid Primary (Default)',
    name: 'group1',
    variant: 'solid',
    color: 'primary',
  },
}

export const Glass: Story = {
  args: { label: 'Glass Variant', name: 'group2', variant: 'glass' },
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
    label: 'Solid Secondary',
    name: 'group3',
    variant: 'solid',
    color: 'secondary',
  },
}

export const SmallSize: Story = {
  args: { label: 'Small Radio', name: 'group4', size: 'sm' },
}

export const WithoutLabel: Story = {
  args: { name: 'group5' },
}

export const Disabled: Story = {
  args: { label: 'Disabled Radio', name: 'group6', disabled: true },
}
