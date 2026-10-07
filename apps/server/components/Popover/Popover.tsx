import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { popoverVariants, PopoverVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Custom props specific to the Popover component.
 */
type PopoverCustomProps = {
  /** The content rendered inside the floating popover panel */
  content: React.ReactNode
  /** Controlled state: Forces the popover to remain open or closed from a parent component */
  open?: boolean
  /** Uncontrolled state: Initial open/closed status when no controlled 'open' prop is provided */
  defaultOpen?: boolean
  /** Event callback fired when the popover toggles open or closed */
  onToggle?: (isOpen: boolean) => void
  /** Enables or disables auto-closing the popover when clicking outside the component boundary */
  closeOnOutsideClick?: boolean
}

/**
 * Combination of custom popover props and CVA variant props.
 */
type CleanProps = Prettify<PopoverCustomProps & PopoverVariantsType>

/**
 * PopoverProps extends standard HTML Div attributes while excluding 'content' to avoid prop collisions.
 */
export type PopoverProps = CleanProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>

/**
 * Popover Component
 *
 * A floating container component that displays contextual content when a trigger element is clicked.
 * Features:
 * - Controlled (`open`) and Uncontrolled (`defaultOpen`) state patterns
 * - Click-outside to close auto-dismissal
 * - Full Keyboard & ARIA accessibility support (`Enter`/`Space` triggers, `role="button"`, `role="dialog"`)
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      content,
      children,
      align,
      variant,
      open: openProp,
      defaultOpen = false,
      onToggle,
      closeOnOutsideClick = true,
      className,
      ...rest
    } = props

    // STATE MANAGEMENT (Controlled vs. Uncontrolled Pattern):
    // 1. 'isOpenState' manages toggle state locally when 'open' prop is not passed.
    // 2. 'isOpen' computes the actual source of truth (uses 'openProp' if defined, otherwise falls back to 'isOpenState').
    const [isOpenState, setIsOpenState] = useState(defaultOpen)
    const isOpen = openProp === undefined ? isOpenState : openProp

    // Ref attached to the main anchor element to detect boundary-crossing click events.
    const anchorRef = useRef<HTMLDivElement>(null)

    // Expose the internal anchorRef to external callers passing a forwarded ref
    useImperativeHandle(ref, () => anchorRef.current as HTMLDivElement)

    /**
     * Helper function to update internal state and fire the optional 'onToggle' callback.
     */
    const handleToggle = (nextState: boolean) => {
      setIsOpenState(nextState)
      if (onToggle) onToggle(nextState)
    }

    /**
     * CLICK-OUTSIDE HANDLER HOOK:
     * Attaches a global 'mousedown' event listener to the document when the popover is open.
     * If the user clicks anywhere outside the 'anchorRef' boundary, the popover automatically closes.
     */
    useEffect(() => {
      // If click-outside is disabled or the popover is closed, no event listener is needed.
      if (!closeOnOutsideClick || !isOpen) return

      const handleOutsideClick = (event: MouseEvent) => {
        // Check if the click occurred outside the anchor element's DOM hierarchy
        if (
          anchorRef.current &&
          !anchorRef.current.contains(event.target as Node)
        ) {
          handleToggle(false)
        }
      }

      // Attach global listener when popover opens
      document.addEventListener('mousedown', handleOutsideClick)

      // Cleanup function: Removes the listener when popover closes or component unmounts to prevent memory leaks
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [closeOnOutsideClick, isOpen, onToggle])

    return (
      // Outer Container:
      // 'relative' ensures the floating popover panel positions relative to this anchor box.
      // 'inline-block' wraps around the trigger child content.
      <div className="relative inline-block cursor-pointer" ref={anchorRef}>
        {/* 
          Trigger Element Wrapper:
          - Uses role="button" & tabIndex={0} for semantic accessibility without nesting native <button> elements.
          - Supports both mouse click and keyboard activation (Enter / Space keys).
          - 'cursor-inherit' passes the cursor style down to child elements.
        */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => handleToggle(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggle(!isOpen)
            }
          }}
          className="inline-block cursor-inherit"
        >
          {children}
        </div>

        {/* 
          Floating Popover Panel:
          - Rendered conditionally only when 'isOpen' is true.
          - Applies alignment and style variants generated via 'popoverVariants'.
          - Marked with role="dialog" for screen readers.
        */}
        {isOpen && (
          <div
            role="dialog"
            className={cn(
              popoverVariants({ align, variant }),
              'mt-2 top-full',
              className
            )}
            {...rest}
          >
            {content}
          </div>
        )}
      </div>
    )
  }
)

Popover.displayName = 'Popover'
