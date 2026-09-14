'use client'

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  isValidElement,
  cloneElement,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../Utils/utils'
import { Box } from '../Box/Box'
import { dropdownMenuVariants } from './styles'

/**
 * THE 4 LAWS OF ACTION MENU ARCHITECTURE:
 * 1. Law 1 Evolution (The Portal Escape): To survive strict `overflow: hidden` layouts (like Tables or Cards),
 *    the menu physically detaches from the DOM tree and teleports to the end of `document.body`.
 * 2. Law 2 (Click-Outside Physics): Must close on external clicks. Because of the portal,
 *    we must check if the click happened outside BOTH the trigger and the floating menu.
 * 3. Law 3 (Coordinate Tracking): The portal needs exact X/Y coordinates. We use `getBoundingClientRect`
 *    to dynamically pin the floating menu to the trigger, adapting to scrolling and resizing.
 * 4. Law 4 (Compound Agnostic): Unlike a Select, an Action Menu doesn't care about "values".
 *    It just renders arbitrary children (like Buttons) that execute actions.
 */

export type DropdownMenuProps = {
  /** The element that opens the menu (e.g., an Icon Button) */
  trigger: React.ReactNode
  /** The content of the menu (e.g., a Stack of Buttons) */
  children: React.ReactNode
  /** Controlled State: Is the menu open? */
  isOpen?: boolean
  /** Controlled State: Fired when the menu should close */
  onClose?: () => void
  /** Controlled State: Fired when the menu should open */
  onOpen?: () => void
  /** Should the menu align to the left or right of the trigger? */
  align?: 'left' | 'right'
}

/**
 * A highly flexible, accessible Dropdown Menu component.
 * Uses a React Portal to escape overflow container clipping and dynamically positions itself relative to the trigger.
 */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (props, ref) => {
    const {
      trigger,
      children,
      isOpen: controlledIsOpen,
      onClose: controlledOnClose,
      onOpen: controlledOnOpen,
      align = 'left',
    } = props

    // =========================================================================
    // STATE & MODE CHECK (CONTROLLED VS UNCONTROLLED)
    // =========================================================================
    // Support both Controlled (from parent props) and Uncontrolled (internal state) modes.
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isOpen =
      controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

    // Helper function to safely execute the close action in either mode.
    const handleClose = useCallback(() => {
      if (controlledOnClose) {
        controlledOnClose()
      } else {
        setInternalIsOpen(false)
      }
    }, [controlledOnClose])

    // =========================================================================
    // DOM REFS
    // =========================================================================
    // triggerContainerRef: Tracks the outer wrapper of the trigger to calculate positioning.
    const triggerContainerRef = useRef<HTMLDivElement>(null)
    // menuRef: Tracks the floating menu wrapper to detect click-outside events.
    const menuRef = useRef<HTMLDivElement>(null)
    // showTrigger: Ensures we only execute rendering on the client side (protects SSR).
    const [showTrigger, setShowTrigger] = useState(false)

    // =========================================================================
    // PORTAL COORDINATES & POSITIONING ENGINE
    // =========================================================================
    // Stores the calculated top, left, and minimum width dimensions for the portal dropdown.
    const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 0 })

    // Calculates the absolute viewport-relative position of the trigger button.
    const updateCoords = useCallback(() => {
      if (triggerContainerRef.current) {
        const rect = triggerContainerRef.current.getBoundingClientRect()

        setCoords({
          // Positioned immediately below the trigger, plus 8px spacing
          top: rect.bottom + window.scrollY + 8,
          // Calculate left-alignment or right-alignment relative to trigger
          left:
            align === 'left'
              ? rect.left + window.scrollX
              : rect.right + window.scrollX,
          // Constrain width to at least match the width of the trigger wrapper
          minWidth: rect.width,
        })
      }
    }, [align])

    // Toggles the state or fires parent callbacks when clicked.
    const handleToggle = () => {
      if (isOpen) {
        handleClose()
      } else {
        updateCoords()
        if (controlledOnOpen) {
          controlledOnOpen()
        } else {
          setInternalIsOpen(true)
        }
      }
    }

    // =========================================================================
    // EVENT LISTENERS & PHYSICS (Outside clicks, resize, scroll)
    // =========================================================================
    useEffect(() => {
      setShowTrigger(true)

      // Closes the menu if the user clicks anywhere outside of both the trigger wrapper and the portal menu.
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node
        const clickedOutsideTrigger =
          triggerContainerRef.current &&
          !triggerContainerRef.current.contains(target)
        const clickedOutsideMenu =
          menuRef.current && !menuRef.current.contains(target)

        if (isOpen && clickedOutsideTrigger && clickedOutsideMenu) {
          handleClose()
        }
      }

      // Keep position updated and handle outside clicks when dropdown is open.
      if (isOpen) {
        updateCoords()
        document.addEventListener('mousedown', handleOutsideClick)
        window.addEventListener('resize', updateCoords)
        // Set useCapture to true to capture scrolling events anywhere in the viewport tree
        window.addEventListener('scroll', updateCoords, true)
      }

      // Cleanup event listeners on close or unmount
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
        window.removeEventListener('resize', updateCoords)
        window.removeEventListener('scroll', updateCoords, true)
      }
    }, [isOpen, handleClose, updateCoords])

    // Prevent Server-Side Rendering (SSR) hydration mismatch/flickering
    if (!showTrigger) return null

    return (
      /* 
        Ref Merge: We merge the forwarded external ref with our internal triggerContainerRef 
        so that this component is easily consumable and correctly measurable.
      */
      <div
        className="relative inline-block"
        ref={(node) => {
          // Set our internal ref for coordinate tracking
          ;(
            triggerContainerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node
          // Forward the node to the external ref provided by the parent
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
      >
        {/* 
          Trigger Injection: If trigger is a valid React component, we clone it
          and inject accessibility attributes (aria-expanded, aria-haspopup) 
          along with our click-to-toggle logic, preserving the original click callback.
        */}
        {isValidElement(trigger)
          ? cloneElement(
              trigger as React.ReactElement<
                React.HTMLAttributes<HTMLElement> & {
                  onClick?: React.MouseEventHandler
                }
              >,
              {
                'aria-expanded': isOpen,
                'aria-haspopup': 'menu',
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  const triggerElement = trigger as React.ReactElement<{
                    onClick?: React.MouseEventHandler
                  }>

                  // Safely preserve and call the original onClick if it exists on the trigger element
                  if (triggerElement.props.onClick) {
                    triggerElement.props.onClick(e)
                  }
                  handleToggle()
                },
              }
            )
          : trigger}

        {/* 
          Portal Rendering: Teleports the dropdown menu box to document.body,
          completely escaping overflow:hidden boundaries of parents.
        */}
        {isOpen &&
          createPortal(
            <Box
              ref={menuRef}
              role="menu"
              className={cn(
                dropdownMenuVariants({ state: isOpen ? 'open' : 'closed' }),
                'absolute z-popover shadow-overlay border-border-default',
                align === 'right'
                  ? '-translate-x-full origin-top-right'
                  : 'origin-top-left'
              )}
              style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                minWidth: `${Math.max(coords.minWidth, 200)}px`,
              }}
              onClick={handleClose}
            >
              {children}
            </Box>,
            document.body
          )}
      </div>
    )
  }
)

DropdownMenu.displayName = 'DropdownMenu'
