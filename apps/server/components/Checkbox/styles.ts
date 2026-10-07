import { cva, type VariantProps } from 'class-variance-authority'

export const checkboxVariants = cva(
  [
    'appearance-none',
    'rounded-small',
    'cursor-pointer',
    'transition-all',
    'animate-duration-fast',
    'focus:ring-2 focus:ring-border-focused focus:outline-none',
  ],
  {
    variants: {
      variant: {
        solid: [
          'bg-surface-base',
          'border border-border-default',
          'hover:border-border-strong',
        ],
        glass: [
          'bg-surface-base/30',
          'backdrop-blur-md',
          'border border-border-default/50',
          'checked:backdrop-blur-lg',
        ],
      },
      size: { sm: 'w-4 h-4', md: 'w-5 h-5' },
      color: {
        primary: 'checked:!bg-action-primary checked:!border-action-primary',
        secondary:
          'checked:!bg-action-secondary checked:!border-action-secondary',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md', color: 'primary' },
  }
)
export type CheckboxVariantsType = VariantProps<typeof checkboxVariants>
