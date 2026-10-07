import { cva, type VariantProps } from 'class-variance-authority'
export const radioVariants = cva(
  [
    'appearance-none',
    'rounded-full',
    'm-0',
    'cursor-pointer',
    'transition-all',
    'animate-duration-fast',
    'focus:ring-2 focus:ring-border-focused focus:outline-none',
    'checked:bg-[radial-gradient(circle,white_35%,transparent_35%)]',
  ],
  {
    variants: {
      variant: {
        solid: ['bg-surface-base', 'border border-border-default'],
        glass: [
          'bg-surface-base/30',
          'backdrop-blur-md',
          'border border-border-default/50',
          'checked:backdrop-blur-lg',
        ],
      },
      size: { sm: 'w-4 h-4', md: 'w-5 h-5' },
      color: {
        primary: 'text-action-primary',
        secondary: 'text-action-secondary',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        color: 'primary',
        className: 'checked:bg-action-primary checked:border-action-primary',
      },
      {
        variant: 'solid',
        color: 'secondary',
        className:
          'checked:bg-action-secondary checked:border-action-secondary',
      },
      {
        variant: 'glass',
        color: 'primary',
        className:
          'checked:bg-action-primary/80 checked:border-action-primary/80',
      },
      {
        variant: 'glass',
        color: 'secondary',
        className:
          'checked:bg-action-secondary/80 checked:border-action-secondary/80',
      },
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'primary' },
  }
)
export type RadioVariantsType = VariantProps<typeof radioVariants>
