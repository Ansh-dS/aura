import React, { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import {
  modalWrapperVariants,
  modalContentVariants,
  ModalVariantsType,
} from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Custom props specific to the Modal dialog component.
 */
type ModalCustomProps = {
  /** Controls whether the modal is visible on screen */
  isOpen: boolean
  /** Callback fired to close the modal (e.g. on backdrop click, escape key, or close button) */
  onClose: () => void
  /** Modal body content */
  children: React.ReactNode
  /** Optional title heading displayed at the top of the modal */
  title?: React.ReactNode
  /** When true, pressing the 'Escape' key closes the modal (default: true) */
  closeOnEsc?: boolean
  /** When true, clicking on the dark backdrop outside the modal closes it (default: true) */
  closeOnBackdrop?: boolean
  /** Optional element ref to receive initial focus when the modal opens */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Additional custom CSS class names */
  className?: string
}

type CleanProps = Prettify<ModalCustomProps & ModalVariantsType>

export type ModalProps = CleanProps

/**
 * Modal Component: A fully accessible, portaled dialog window.
 *
 * Features:
 * - Portaled directly into `document.body` to avoid overflow clipping and stacking context issues.
 * - Complete Focus Trapping (cycles focus within the modal on Tab / Shift+Tab).
 * - Focus Restoration (returns focus to the triggering element upon closing).
 * - Background Scroll Locking (prevents background body scroll when open).
 * - WAI-ARIA Modal Accessibility (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
 */
export function Modal(props: ModalProps): React.ReactElement | null {
  const {
    isOpen,
    onClose,
    size,
    title,
    closeOnEsc = true,
    closeOnBackdrop = true,
    initialFocusRef,
    className,
    children,
  } = props

  // References to the modal DOM element and the element that was focused before the modal opened
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  // Unique accessible ID generated for connecting title heading with aria-labelledby
  const titleId = useId()

  /* -------------------------------------------------------------------------- */
  /* 1. KEYBOARD NAVIGATION & FOCUS TRAPPING (Tab & Escape)                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape Key: Close modal if enabled
      if (closeOnEsc && e.key === 'Escape') {
        onClose()
        return
      }

      // Focus Trapping: Trap Tab / Shift+Tab navigation within modal boundaries
      if (e.key === 'Tab') {
        if (!modalRef.current) return

        // Query all focusable elements inside the modal frame
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )

        if (focusableElements.length === 0) {
          // If no focusable elements exist, prevent tab from leaving the modal
          e.preventDefault()
          return
        }

        const firstElement = focusableElements[0]!
        const lastElement = focusableElements[focusableElements.length - 1]!

        if (e.shiftKey) {
          // Shift + Tab: If focusing first element or modal wrapper, wrap around to last focusable element
          if (
            document.activeElement === firstElement ||
            document.activeElement === modalRef.current
          ) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab: If focusing last element, wrap around to first focusable element
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEsc, onClose])

  /* -------------------------------------------------------------------------- */
  /* 2. BODY SCROLL LOCKING & INITIAL/RESTORED FOCUS                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      // 1. Capture currently active element so we can restore focus when modal closes
      previousFocusRef.current = document.activeElement as HTMLElement

      // 2. Lock background scrolling on the document body
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'

      // 3. Set initial focus:
      // Priority 1: User-specified initialFocusRef
      // Priority 2: First focusable child in modal
      // Priority 3: Modal dialog container itself
      if (initialFocusRef && initialFocusRef.current) {
        initialFocusRef.current.focus()
      } else if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable) {
          firstFocusable.focus()
        } else {
          modalRef.current.focus()
        }
      }

      // Cleanup: Restore body scroll and return focus to the trigger button
      return () => {
        document.body.style.overflow = originalStyle
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, initialFocusRef])

  // If closed or running on SSR (where document is undefined), render nothing
  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  /* -------------------------------------------------------------------------- */
  /* 3. MODAL CONTENT & PORTALING                                               */
  /* -------------------------------------------------------------------------- */
  const modalContent = (
    <div className={cn(modalWrapperVariants())}>
      {/* 
        Backdrop Overlay:
        - Full-screen blurred backdrop layer.
        - aria-hidden="true" tells assistive technologies to ignore this decorative layer.
        - Clicking backdrop triggers onClose callback if closeOnBackdrop is enabled.
      */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 
        Modal Dialog Card:
        - role="dialog" & aria-modal="true" identify this as a modal dialog to screen readers.
        - aria-labelledby binds dialog to the title heading ID for accessible announcement.
        - tabIndex={-1} allows programmatically focusing the modal container if no focusable children exist.
      */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(modalContentVariants({ size }), className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Title Heading Slot */}
        {title && (
          <h2 id={titleId} className="text-h3 font-bold mb-4 text-fg-primary">
            {title}
          </h2>
        )}

        {/* Modal Main Children Content */}
        <div className="text-body text-fg-secondary">{children}</div>

        {/* Close Button Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fg-secondary hover:text-fg-primary text-h3"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  )

  // Portal to document.body to break free of parent z-index and overflow:hidden constraints
  return createPortal(modalContent, document.body)
}
