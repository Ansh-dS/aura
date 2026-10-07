import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch, ThemeProvider } from '@components'

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-xl bg-surface-base border border-border-default border-0 rounded-large shadow-sm inline-block flex justify-center">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}
export default meta
export const Default: StoryObj<typeof Switch> = {
  args: { label: 'Toggle Feature', checked: false },
}
