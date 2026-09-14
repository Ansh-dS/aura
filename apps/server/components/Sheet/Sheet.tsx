import React, { forwardRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  sheetOverlayVariants,
  sheetContentVariants,
  SheetVariantsType,
} from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SheetCustomProps = {
  /** Controlled state: controls visibility of the sheet drawer */
  isOpen: boolean
  /** Callback function fired when the backdrop is clicked or the Escape key is pressed */
  onClose: () => void
  /** Optional title heading displayed in the sheet header */
  title?: string
  /** Optional description text displayed below the title */
  description?: string
}

type CleanProps = Prettify<SheetCustomProps & SheetVariantsType>

export type SheetProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

/**
 * Sheet Component: An overlay drawer panel that slides in from any edge of the viewport.
 * Portals directly into `document.body` to avoid overflow clipping issues, and incorporates
 * scroll locking and keyboard accessibility parameters.
 */
export const Sheet = forwardRef<HTMLDivElement, SheetProps>((props, ref) => {
  const {
    className,
    side,
    isOpen,
    onClose,
    title,
    description,
    children,
    ...rest
  } = props

  // Scroll Lock Side Effect: Lock background scrolling when sheet is active,
  // restoring it when the component is hidden or unmounted.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Keyboard Navigation: Listen to key presses and trigger close handler on Escape.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="relative">
      {/* 
        Full-screen Backdrop:
        aria-hidden="true" tells screen readers to ignore this decorative layer.
      */}
      <div
        className={sheetOverlayVariants()}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 
        Slide-out Dialog Frame:
        role="dialog" & aria-modal="true" establish structural dialog semantics for assistive technology.
        data-state coordinates CSS entry/exit animations defined in styles.ts.
      */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(sheetContentVariants({ side }), className)}
        {...rest}
      >
        {/* Optional Header Area */}
        {(title || description) && (
          <div className="flex flex-col gap-xs p-l border-b border-border-default">
            {title && (
              <h2 className="text-h3 font-weight-semibold text-fg-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-body text-fg-secondary">{description}</p>
            )}
          </div>
        )}
        {/* Scrollable Children Content Area */}
        <div className="flex-1 overflow-y-auto p-l">{children}</div>
      </div>
    </div>,
    document.body
  )
})

Sheet.displayName = 'Sheet'
