import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { toastVariants, type ToastVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Button } from '../Button/Button'

/**
 * THE 4 LAWS OF TOAST ARCHITECTURE (Updated for Name Clarity):
 * 1. Law of Composition: Use compound children (<ToastTitle>, <ToastDescription>).
 * 2. Law of Context: Parent <Toast> dictates intent; children consume via ToastContext.
 * 3. Law of A11y: Error/Warning = role="alert", Info/Success = role="status".
 * 4. Law of the Triad: Icon (Left) -> Content (Center) -> Action (Right).
 */

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/* -------------------------------------------------------------------------- */
/* INTERNAL CONTEXT (For Compound UI Synchronization)                         */
/* -------------------------------------------------------------------------- */

/**
 * Props shared between the main Toast container and its compound sub-components.
 * Ensures synchronized layout styling without manual prop-drilling.
 */
type ToastUIContextProps = {
  intent: NonNullable<ToastVariantsType['intent']>
  variant: NonNullable<ToastVariantsType['variant']>
}

const ToastUIContext = createContext<ToastUIContextProps>({
  intent: 'default',
  variant: 'subtle',
})

export type ToastProps = Prettify<ToastVariantsType> &
  React.HTMLAttributes<HTMLDivElement>

/**
 * Toast Container: Wraps the notification content, manages intent-to-accessibility mappings,
 * and distributes styling context to children (icon, title, desc, close).
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const {
    intent = 'default',
    variant = 'subtle',
    className,
    children,
    ...rest
  } = props

  // Accessibility Role mapping: errors/warnings announce as disruptive 'alerts',
  // whereas info/success notify users softly using standard 'status' logs.
  const role = intent === 'error' || intent === 'warning' ? 'alert' : 'status'

  return (
    <ToastUIContext.Provider
      value={{
        intent: intent as NonNullable<ToastUIContextProps['intent']>,
        variant: variant as NonNullable<ToastUIContextProps['variant']>,
      }}
    >
      <Box
        ref={ref}
        role={role}
        className={cn(toastVariants({ intent, variant }), className)}
        {...rest}
      >
        {children}
      </Box>
    </ToastUIContext.Provider>
  )
})
Toast.displayName = 'Toast'

/**
 * ToastIcon: Automatically resolves and displays an icon fitting the parent's intent.
 * Fallbacks are provided if custom icon elements aren't supplied as children.
 */
export const ToastIcon = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...rest }, ref) => {
  const { intent, variant } = useContext(ToastUIContext)

  const IconComponent =
    intent === 'info'
      ? Info
      : intent === 'success'
        ? CheckCircle
        : intent === 'warning'
          ? AlertTriangle
          : intent === 'error'
            ? XCircle
            : Info

  // STAFF FIX: If solid, icon must be white. Otherwise, color it by intent.
  const iconColorClass =
    variant === 'solid'
      ? 'text-fg-inverted'
      : intent === 'info'
        ? 'text-status-info'
        : intent === 'success'
          ? 'text-status-success'
          : intent === 'warning'
            ? 'text-status-warning'
            : intent === 'error'
              ? 'text-status-danger'
              : 'text-fg-primary'

  return (
    <Box
      ref={ref}
      className={cn(
        'shrink-0 mt-0.5 border-0 bg-transparent',
        iconColorClass,
        className
      )}
      {...rest}
    >
      {children || <IconComponent size={18} />}
    </Box>
  )
})
ToastIcon.displayName = 'ToastIcon'

/**
 * ToastContent: Organizes text stack components (ToastTitle & ToastDescription)
 * vertically with standardized spacing.
 */
export const ToastContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...rest }, ref) => (
  <Stack
    ref={ref}
    direction="vertical"
    gap="sm"
    className={cn('flex-1 border-0 bg-transparent mt-[2px]', className)}
    {...rest}
  >
    {children}
  </Stack>
))
ToastContent.displayName = 'ToastContent'

/**
 * ToastTitle: Renders the primary text label. Adapts contrast color
 * depending on whether the Toast has a filled or transparent background style.
 */
export const ToastTitle = forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>
>(({ className, ...rest }, ref) => {
  const { variant } = useContext(ToastUIContext)

  // STAFF FIX: Like the Button, solid variants need inverted text.
  const titleColor = variant === 'solid' ? 'inverted' : 'primary'

  return (
    <Text
      ref={ref}
      variant="label"
      weight="semibold"
      color={titleColor}
      className={className}
      {...rest}
    />
  )
})
ToastTitle.displayName = 'ToastTitle'

/**
 * ToastDescription: Renders descriptive details below the title.
 * Automatically aligns color contrast with the parent background style.
 */
export const ToastDescription = forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>
>(({ className, ...rest }, ref) => {
  const { variant } = useContext(ToastUIContext)

  // STAFF FIX: Solid needs inverted. Subtle/Glass needs secondary.
  const descColor = variant === 'solid' ? 'inverted' : 'secondary'

  return (
    <Text
      ref={ref}
      variant="body"
      color={descColor}
      className={cn(
        'leading-relaxed',
        variant === 'solid' && 'opacity-90',
        className
      )}
      {...rest}
    />
  )
})
ToastDescription.displayName = 'ToastDescription'

/**
 * ToastAction: Interactive button, traditionally used for close/dismiss operations.
 * Auto-corrects contrasts for visibility over solid variants.
 */
export const ToastAction = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>
>(({ className, onClick, ...rest }, ref) => {
  const { variant } = useContext(ToastUIContext)

  // STAFF FIX: Ensure the X button is visible on solid backgrounds
  const btnColor = variant === 'solid' ? 'inverted' : 'secondary'

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      color={btnColor}
      className={cn(
        'shrink-0 -mr-2 -mt-2 hover:bg-black/5 dark:hover:bg-white/10',
        className
      )}
      onClick={onClick}
      aria-label="Dismiss"
      {...rest}
    >
      <X size={16} />
    </Button>
  )
})
ToastAction.displayName = 'ToastAction'

/**
 * Representation of an active individual toast alert metadata in the overlay viewport.
 */
type ToastItem = {
  id: string
  intent: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  duration?: number
  variant?: 'solid' | 'subtle' | 'glass'
  hideIcon?: boolean
  hideClose?: boolean
}

const TOAST_EVENT = 'UI_LIBRARY_TOAST_EVENT'

/**
 * Triggers a toast globally using a custom event dispatched on window.
 * Avoids parent page re-renders: Only the ToastViewport listening to this event updates.
 *
 * @example
 * showToast({ intent: 'success', title: 'Successfully saved!' })
 */
export const showToast = (config: Omit<ToastItem, 'id'>) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: config }))
  }
}

/**
 * React hook interface returning the global `showToast` trigger function.
 */
export const useToast = () => ({ showToast })

// 3. The isolated viewport (Listens for events)
/**
 * Renders the container viewport absolute overlay positioned at the bottom right.
 * Intercepts window events to enqueue, animate, and time out notifications.
 */
const ToastViewport = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const addAndExpireToast = (e: Event) => {
      const detail = (e as CustomEvent<Omit<ToastItem, 'id'>>).detail
      const id = Math.random().toString(36).substring(2, 9)

      // Retain max 3 toasts at a time
      setToasts((prev) => [...prev, { ...detail, id }].slice(-3))

      // Clear toast after timeout
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, detail.duration || 5000)
    }

    window.addEventListener(TOAST_EVENT, addAndExpireToast)
    return () => window.removeEventListener(TOAST_EVENT, addAndExpireToast)
  }, [])

  if (toasts.length === 0 || typeof document === 'undefined') return null

  // inset: moves our alerts at the bottom right corner.
  return createPortal(
    <div className="fixed inset-x-4 bottom-4 z-popover pointer-events-none flex justify-end">
      <Stack
        direction="vertical"
        gap="sm"
        className="pointer-events-auto w-full max-w-105 items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-right-10 fade-in w-full"
          >
            <Toast
              intent={toast.intent}
              variant={toast.variant || 'subtle'}
              className="w-full"
            >
              {!toast.hideIcon && <ToastIcon />}

              <ToastContent>
                <ToastTitle>{toast.title}</ToastTitle>
                {toast.description && (
                  <ToastDescription>{toast.description}</ToastDescription>
                )}
              </ToastContent>

              {!toast.hideClose && (
                <ToastAction
                  onClick={() =>
                    setToasts((p) => p.filter((t) => t.id !== toast.id))
                  }
                />
              )}
            </Toast>
          </div>
        ))}
      </Stack>
    </div>,
    document.body
  )
}

/**
 * Root wrapper provider for mounting the global `ToastViewport`.
 * Should wrap top-level children elements.
 */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  )
}
