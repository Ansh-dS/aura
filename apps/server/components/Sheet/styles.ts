import { cva, type VariantProps } from 'class-variance-authority'

export const sheetOverlayVariants = cva(
  'fixed inset-0 z-[var(--zIndices-overlay)] bg-surface-overlay/80 backdrop-blur-sm transition-opacity'
)

export const sheetContentVariants = cva(
  'fixed z-[var(--zIndices-modal)] flex flex-col bg-surface-base shadow-popout transition ease-in-out duration-300',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b border-border-default',
        bottom: 'inset-x-0 bottom-0 border-t border-border-default',
        left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r border-border-default',
        right:
          'inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l border-border-default',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
)

export type SheetVariantsType = VariantProps<typeof sheetContentVariants>
