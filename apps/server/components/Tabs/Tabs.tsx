import React, { forwardRef, createContext, useContext, useState } from 'react'
import {
  tabsListVariants,
  tabsTriggerVariants,
  TabsListVariantsType,
} from './styles'
import { cn } from '../Utils/utils'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Button } from '../Button/Button'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                    */
/* -------------------------------------------------------------------------- */
type TabsContextValue = {
  /** The identifier of the currently active tab */
  activeTab: string
  /** Callback fired when a new tab is selected */
  onTabChange: (tab: string) => void
  /** The theme/style variant of the tab list (e.g., 'underline', 'pill', 'glass') */
  variant?: TabsListVariantsType['variant']
  /** Layout direction: 'horizontal' or 'vertical' */
  orientation?: TabsListVariantsType['orientation']
  /** Size modifier matching global component density scales: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * TabsContext provides state and configuration (size, orientation, variant)
 * to child components (TabsList, TabsTrigger, TabsContent) to orchestrate tab behavior.
 */
const TabsContext = createContext<TabsContextValue | undefined>(undefined)

/**
 * Custom hook to consume TabsContext.
 * Throws a developer-friendly error if a child subcomponent is rendered outside <Tabs>.
 */
const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context)
    throw new Error('Tabs components must be used within a <Tabs> provider.')
  return context
}

/* -------------------------------------------------------------------------- */
/* ROOT CONTAINER (<Tabs>)                                                    */
/* -------------------------------------------------------------------------- */
type TabsVariantProps = {
  /** Visual variation theme */
  variant?: TabsListVariantsType['variant']
  /** Layout orientation. When 'vertical', applies flex columns. */
  orientation?: TabsListVariantsType['orientation']
  /** Size density scale */
  size?: 'sm' | 'md' | 'lg'
}

export type TabsProps = Prettify<
  React.HTMLAttributes<HTMLDivElement> & {
    /** The default active tab for uncontrolled usage */
    defaultValue?: string
    /** The controlled active tab value */
    value?: string
    /** Callback triggered when a new tab is selected */
    onTabChange?: (tab: string) => void
  } & TabsVariantProps
>

/**
 * Tabs Component
 * The root orchestration layer. Manages active tab state (controlled or uncontrolled)
 * and exposes theme context to its layout descendants.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const {
    defaultValue: defaultTab,
    value: controlledTab,
    onTabChange,
    variant = 'underline',
    orientation = 'horizontal',
    size = 'md',
    className,
    children,
    ...rest
  } = props

  // Uncontrolled state: tracks the active tab locally when not controlled by parent
  const [selectedTabState, setSelectedTabState] = useState(defaultTab || '')

  // Resolves the active tab (controlled prop takes priority over local state)
  const activeTab =
    controlledTab !== undefined ? controlledTab : selectedTabState

  const handleTabChange = (newTab: string) => {
    setSelectedTabState(newTab)
    if (onTabChange) onTabChange(newTab)
  }

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        onTabChange: handleTabChange,
        variant,
        orientation,
        size,
      }}
    >
      {/* STAFF FIX: Using Box for the root container */}
      <Box
        as="div"
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          orientation === 'vertical' ? 'flex gap-l' : 'block',
          className
        )}
        {...rest}
      >
        {children}
      </Box>
    </TabsContext.Provider>
  )
})
Tabs.displayName = 'Tabs'

/* -------------------------------------------------------------------------- */
/* TABS LIST (<TabsList>) - The Track                                         */
/* -------------------------------------------------------------------------- */

/**
 * TabsList Component
 * Acts as the track container for `<TabsTrigger>` buttons. Extends the `<Stack>` primitive
 * to handle trigger layout, orientation direction, and layout gaps dynamically.
 */
export const TabsList = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { className, children, ...rest } = props
  const { variant, orientation } = useTabsContext()
  const resolvedOrientation = orientation ?? 'horizontal'

  return (
    // We use Stack as the layout engine for the tab triggers
    <Stack
      as="div"
      ref={ref}
      role="tablist"
      aria-orientation={resolvedOrientation}
      direction={resolvedOrientation}
      /** * Gap Logic:
       * 'underline' needs 'none' so the active borders create a continuous line.
       * 'pill' and 'glass' need 'sm' (8px) so the 3D buttons don't touch each other.
       */
      gap={variant === 'underline' ? 'none' : 'sm'}
      className={cn(
        tabsListVariants({ variant, orientation: resolvedOrientation }),
        className
      )}
      {...rest}
    >
      {/* CRITICAL FIX: 
          This is where your <TabsTrigger /> components will live. 
      */}
      {children}
    </Stack>
  )
})
TabsList.displayName = 'TabsList'

/* -------------------------------------------------------------------------- */
/* TABS TRIGGER (<TabsTrigger>) - The Button                                  */
/* -------------------------------------------------------------------------- */
export type TabsTriggerProps = Prettify<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
    /** The matching value this trigger represents. Activates the corresponding <TabsContent>. */
    value: string
    /** Optional starting icon node */
    startIcon?: React.ReactNode // We can now pass icons directly because Button supports it!
  }
>

/**
 * TabsTrigger Component
 * The interactive tab selector button. Inherits size and style from parent context
 * and extends the polymorphic `<Button>` primitive to support accessibility roles, active states,
 * and icons natively.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (props, ref) => {
    const { className, value, disabled, children, startIcon, ...rest } = props
    const { activeTab, onTabChange, variant, orientation, size } =
      useTabsContext()

    const isActive = activeTab === value
    const triggerColor: 'primary' | 'secondary' = isActive
      ? 'primary'
      : 'secondary'

    return (
      // STAFF FIX: Using your polymorphic Button!
      <Button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => onTabChange(value)}
        // 1. Base variant is ghost so it inherits your standard hover rules
        variant="ghost"
        // 2. Inherits the size from the parent Tabs context
        size={size}
        // 3. Dynamic color mapping! No CSS text colors needed.
        color={triggerColor}
        startIcon={startIcon}
        className={cn(
          // We override the default ghost button rounded corners if we are using the underline variant
          variant === 'underline' && 'rounded-none',
          // Apply the specific tab modifiers (like the 3D Pop)
          tabsTriggerVariants({ variant, orientation, isActive }),
          className
        )}
        {...rest}
      >
        {children}
      </Button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

/* -------------------------------------------------------------------------- */
/* TABS CONTENT (<TabsContent>) - The Panel                                   */
/* -------------------------------------------------------------------------- */
export type TabsContentProps = Prettify<
  React.HTMLAttributes<HTMLDivElement> & {
    /** The identifier value of this panel. Renders children only when this equals active tab value. */
    value: string
  }
>

/**
 * TabsContent Component
 * Represents the display panel (tabpanel) that conditionally renders when its value matches
 * the currently selected tab trigger value.
 */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  (props, ref) => {
    const { className, value, children, ...rest } = props
    const { activeTab } = useTabsContext()

    // Performance optimization: Render nothing if this tab is inactive
    if (activeTab !== value) return null

    return (
      // STAFF FIX: Using Box for the panel container
      <Box
        as="div"
        ref={ref as React.Ref<HTMLElement>}
        role="tabpanel"
        tabIndex={0}
        className={cn(
          'mt-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused border-0',
          className
        )}
        {...rest}
      >
        {children}
      </Box>
    )
  }
)
TabsContent.displayName = 'TabsContent'
