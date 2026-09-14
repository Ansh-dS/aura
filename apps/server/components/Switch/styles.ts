import { cva, type VariantProps } from 'class-variance-authority'
export const switchVariants = cva(
  [
    'inline-flex',
    'items-center',
    'cursor-pointer',
    'rounded-pill',
    'transition-all',
    'animate-duration-fast',
    'border-2 border-transparent',
    'focus:ring-2 focus:ring-border-focused focus:outline-none',
  ],
  {
    variants: {
      size: {
        sm: 'w-8 h-4', // Perfect 2:1 Ratio
        md: 'w-10 h-5', // Perfect 2:1 Ratio
        lg: 'w-12 h-6', // Perfect 2:1 Ratio
      },
    },
    defaultVariants: { size: 'md' },
  }
)
export type SwitchVariantsType = VariantProps<typeof switchVariants>
