import React, { forwardRef, createContext, useContext } from 'react'
import { sidebarVariants, SidebarVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary'
import { Button, ButtonProps } from '../Button/Button'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { TextVariantsType } from '../Text/styles'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SidebarContextValue = {
  collapsed: boolean
  position: 'left' | 'right'
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  position: 'left',
})

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * THE 4 LAWS OF SIDEBAR ARCHITECTURE:
 * 1. Fixed Scaffolding: The sidebar must act as a fixed structural anchor on the canvas.
 * 2. Internal Rhythm: The Header and Footer must remain permanently pinned, with an independent center scroll zone.
 * 3. Fluid Width: Transitions between collapsed and expanded states must be smooth and visually predictable.
 * 4. Surface Depth: The sidebar must visually separate itself from the main screen using dynamic borders.
 */

type SidebarCustomProps = {
  /** Logo, title, or brand element pinned to the top of the sidebar. */
  header?: React.ReactNode
  /** Main navigation metadata, settings links, or user profiles pinned to the bottom of the sidebar. */
  footer?: React.ReactNode
  /** Placement edge of the sidebar on the viewport canvas. Default is 'left'. */
  position?: 'left' | 'right'
  /** Triggered when the built-in edge collapse button is clicked. */
  onToggle?: () => void
  /** If true, renders the built-in absolute-positioned edge toggle button. */
  showToggle?: boolean
  /**
   * Collapse visual engine:
   * - 'iconStrip': Collapses to a narrow strip (w-16) showing only icons.
   * - 'hide': Slides completely out of view (w-0).
   */
  collapseMode?: 'iconStrip' | 'hide'
  /** Optional icon to remain visible in the footer when the sidebar is collapsed. */
  footerIcon?: React.ReactNode
}

type CleanProps = Prettify<SidebarCustomProps & SidebarVariantsType>

export type SidebarProps = CleanProps & React.HTMLAttributes<HTMLElement>

/**
 * Sidebar Component: A highly flexible layout shell supporting collapsible states,
 * dynamic positioning, custom triggers, and pinned header/footer layout slots.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>((props, ref) => {
  const {
    className,
    variant,
    size,
    collapsed,
    collapseMode,
    layout,
    header,
    footer,
    children,
    position = 'left',
    onToggle,
    showToggle = false,
    footerIcon,
    ...rest
  } = props

  // Determine arrow direction depending on position (left/right sidebar) and collapsed state
  const ToggleIcon =
    position === 'left'
      ? collapsed
        ? ChevronRight
        : ChevronLeft
      : collapsed
        ? ChevronLeft
        : ChevronRight

  // Evaluate if the sidebar is completely out of view
  const isFullyHidden = collapsed && collapseMode === 'hide'

  return (
    <SidebarContext.Provider
      value={{ collapsed: collapsed ?? false, position }}
    >
      <aside
        ref={ref}
        className={cn(
          // CVA variants handle the physical width transition (e.g. w-64 -> w-16 or w-0)
          sidebarVariants({
            collapsed,
            variant,
            size,
            layout,
            position,
            collapseMode,
          }),
          // Apply borders exclusively to the side of the sidebar touching the canvas
          'border-border-default overflow-visible',
          className
        )}
        {...rest}
      >
        {/* 
          Built-in Edge Grip Button:
          Positioned absolutely on the sidebar divider line. It morphs shapes:
          - Circle: Default when open or collapsed to an icon strip.
          - Elongated tab: When fully hidden, extending out from the screen edge.
        */}
        {showToggle && onToggle && (
          <Button
            variant="ghost"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={cn(
              'absolute top-6 z-toast flex items-center justify-center border border-border-default bg-surface-base p-0 shadow-md hover:bg-surface-elevated hover:text-fg-primary cursor-pointer pointer-events-auto',

              // Shape morphing: rounded-full for circular grips, flat rounded-r/l tabs when hidden
              isFullyHidden ? 'h-10 w-5' : 'h-6 w-6 rounded-full',

              // Left edge positioning
              position === 'left' &&
                (isFullyHidden
                  ? '-right-5 rounded-r-md border-l-0'
                  : '-right-3'),

              // Right edge positioning
              position === 'right' &&
                (isFullyHidden ? '-left-5 rounded-l-md border-r-0' : '-left-5')
            )}
          >
            <ToggleIcon size={14} className="text-fg-secondary" />
          </Button>
        )}

        {/* 
          Content Shutter Wrapper:
          Fades out internal elements cleanly when collapsed to 'hide' mode, preventing text squishing.
          We declare 'will-change-[opacity]' to tell the GPU to prepare transitions.
        */}
        <div
          className={cn(
            'flex flex-col flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-150 ease-out will-change-[opacity]',
            collapsed && collapseMode === 'hide'
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          )}
        >
          {/* Header Slot: Locked at the top of the column */}
          {header && (
            <Stack
              direction="horizontal"
              align="center"
              className={cn(
                'w-full border-b border-border-default gap-s shrink-0 overflow-hidden bg-transparent border-0',
                collapsed ? 'px-1 py-4 justify-center' : 'p-m'
              )}
            >
              <Box className="border-0 bg-transparent shrink-0">{header}</Box>
            </Stack>
          )}

          {/* 
            Main Scroll Zone:
            Takes up all remaining vertical space (`flex-1`) with independent scroll (`overflow-y-auto`).
            Ensures navigation links scroll independently of header and footer.
          */}
          <Stack
            direction="vertical"
            className={cn(
              'flex-1 min-h-0 w-full overflow-y-auto gap-s bg-transparent border-0',
              collapsed
                ? 'px-1 py-4 overflow-x-hidden items-center'
                : 'p-m overflow-x-auto'
            )}
          >
            <ErrorBoundary variant="minimal">{children}</ErrorBoundary>
          </Stack>

          {/* Footer Slot: Locked at the bottom of the column */}
          {(footer || footerIcon) && (
            <Stack
              direction="horizontal"
              align="center"
              justify={collapsed ? 'center' : 'start'}
              className={cn(
                'w-full border-t border-border-default shrink-0 overflow-hidden bg-transparent border-0',
                collapsed ? 'p-2' : 'p-m gap-m'
              )}
            >
              {/* Kept visible during collapse if footerIcon is supplied */}
              {footerIcon && (
                <Box className="border-0 bg-transparent shrink-0">
                  {footerIcon}
                </Box>
              )}

              <CollapsibleContent collapsed={collapsed ?? false}>
                {footer}
              </CollapsibleContent>
            </Stack>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  )
})

Sidebar.displayName = 'Sidebar'

/* -------------------------------------------------------------------------- */
/* SIDEBAR ITEM                                                               */
/* -------------------------------------------------------------------------- */

type SidebarItemCustomProps = {
  /** Leading icon component representing the link. */
  icon: React.ReactNode
  /** Text label displayed next to the icon. */
  label: string
  /** If true, applies active brand background and text highlights. */
  active?: boolean
  /** Synchronized state from parent Sidebar to collapse text elements. */
  collapsed?: boolean
  /** Optional notification count or status text badge. */
  badge?: string | number
  /** Color theme overrides for text elements. */
  color?: TextVariantsType['color']
}

type CleanPropsItems = Prettify<SidebarItemCustomProps>

export type SidebarItemProps = CleanPropsItems &
  Omit<ButtonProps, 'children' | 'text' | 'startIcon'>

/**
 * SidebarItem Component: An interactive link/button that morphs from a standard
 * text list item to a centered icon block when the sidebar is collapsed.
 */
export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  (props, ref) => {
    const {
      icon,
      size,
      label,
      active,
      collapsed,
      badge,
      color,
      className,
      isLoading = false,
      ...rest
    } = props

    const resolvedTextColor = color || (active ? 'brand' : 'secondary')
    const resolvedSize = size ?? 'md'

    // Icon dimensions map directly to item size scale
    const resolvedIconSize =
      resolvedSize === 'xl'
        ? 20
        : resolvedSize === 'lg'
          ? 18
          : resolvedSize === 'sm'
            ? 14
            : 16

    const sizedIcon = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
          size: resolvedIconSize,
        })
      : icon

    const resolvedTextVariant =
      resolvedSize === 'xl' || resolvedSize === 'lg'
        ? 'body'
        : resolvedSize === 'sm'
          ? 'caption'
          : 'label'

    const resolvedTextWeight =
      resolvedSize === 'xl' ? 'semibold' : active ? 'semibold' : 'medium'

    return (
      <Button
        ref={ref}
        variant="ghost"
        isLoading={isLoading}
        color={resolvedTextColor}
        iconColor={resolvedTextColor}
        fullWidth={!collapsed}
        size={collapsed ? 'icon' : resolvedSize}
        collapsed={!!collapsed}
        aria-label={label}
        className={cn(
          'group border-none transition-all duration-300 overflow-hidden',

          // Alignment shifts from left-justified (expanded) to center-justified (collapsed strip)
          collapsed
            ? 'justify-center'
            : 'justify-start [&>div]:justify-start [&>div]:w-full px-m',

          active
            ? 'bg-action-primary-subtle hover:bg-action-primary-hover-subtle'
            : 'bg-transparent hover:bg-action-ghost-hover',

          className
        )}
        startIcon={
          <Box
            className={cn(
              // Smooth transform transitions match the speed of the sidebar collapsing
              'transition-transform duration-300 border-0 bg-transparent shrink-0 flex items-center justify-center translate-x-0',
              active ? 'scale-110' : 'group-hover:scale-110'
            )}
          >
            {sizedIcon}
          </Box>
        }
        {...rest}
      >
        <CollapsibleContent collapsed={collapsed || false}>
          <Stack
            direction="horizontal"
            align="center"
            justify="start"
            className="flex-1 w-full bg-transparent border-0"
          >
            <Text
              variant={resolvedTextVariant}
              weight={resolvedTextWeight}
              color={resolvedTextColor}
              className="truncate"
            >
              {label}
            </Text>

            {badge && (
              <Box
                as="span"
                className="bg-action-primary text-fg-inverted border-0 text-[10px] px-xs py-0.5 rounded-pill font-bold shrink-0 ml-xs"
              >
                {badge}
              </Box>
            )}
          </Stack>
        </CollapsibleContent>
      </Button>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'

/**
 * CollapsibleContent Utility Component:
 * Prevents "phantom text layout jumps" during collapse transitions.
 *
 * Why this instead of standard conditional rendering ({ !collapsed && children })?
 * 1. Animation Continuity: Removing components instantly from the React DOM deletes them
 *    with no slide/fade transition, causing layout jumps.
 * 2. Visual Shutter: This keeps components in the DOM but clips them using CSS
 *    (`overflow-hidden`, `whitespace-nowrap`, `opacity-0`, and `w-0`) to slide them out of view smoothly.
 */
export const CollapsibleContent = ({
  children,
  collapsed: collapsedProp,
}: {
  children: React.ReactNode
  collapsed?: boolean
}) => {
  const context = useContext(SidebarContext)
  // Use the prop if passed explicitly, otherwise fallback to context
  const isCollapsed =
    collapsedProp !== undefined ? collapsedProp : context.collapsed
  const position = context.position

  const translateClass =
    position === 'right' ? 'translate-x-2' : '-translate-x-2'

  return (
    <Box
      className={cn(
        // CSS Shutter transition settings
        'flex-1 transition-all duration-300 border-0 bg-transparent ease-in-out overflow-hidden whitespace-nowrap',
        isCollapsed
          ? `opacity-0 w-0 invisible ${translateClass}`
          : 'opacity-100 w-auto visible translate-x-0'
      )}
    >
      {children}
    </Box>
  )
}
