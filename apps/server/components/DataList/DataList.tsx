'use client'

import React, { forwardRef, createContext, useContext } from 'react'
import { dataListVariants, DataListVariantsType } from './styles'
import { cn } from '../Utils/utils'

/* ------------------------------------------------------------------------- */
/* CONTEXT (Dynamic Context Propagation for Shared Layout Variants)          */
/* ------------------------------------------------------------------------- */
type DataListContextProps = {
  /** The spacing variant shared down to all child rows (compact, default, relaxed) */
  spacing: DataListVariantsType['spacing']
  /** The overall layout theme shared down to rows (default, line, inset) */
  variant: DataListVariantsType['variant']
}

const DataListContext = createContext<DataListContextProps>({
  spacing: 'default',
  variant: 'default',
})

/* ------------------------------------------------------------------------- */
/* PARENT CONTAINER (<DataList>)                                             */
/* ------------------------------------------------------------------------- */
type Prettify<T> = { [K in keyof T]: T[K] } & {}

type CleanDataListProps = Prettify<DataListVariantsType>
export type DataListProps = CleanDataListProps &
  React.HTMLAttributes<HTMLDivElement>

/**
 * DataList Component: A semantic list container designed to render key-value details,
 * settings menus, or item collections. Propagates spacing and design variants
 * down to child elements using a context provider.
 */
export const DataList = forwardRef<HTMLDivElement, DataListProps>(
  (props, ref) => {
    const {
      className,
      spacing = 'default',
      variant = 'default',
      children,
      ...rest
    } = props

    return (
      <DataListContext.Provider value={{ spacing, variant }}>
        <div
          ref={ref}
          // role="list" informs screen readers that this is a list navigation/content group
          role="list"
          className={cn(dataListVariants({ spacing, variant }), className)}
          {...rest}
        >
          {children}
        </div>
      </DataListContext.Provider>
    )
  }
)

DataList.displayName = 'DataList'

/* ------------------------------------------------------------------------- */
/* ROW COMPONENT (<DataListItem>)                                            */
/* ------------------------------------------------------------------------- */
type DataListItemCustomProps = {
  /** Enables hover scaling, cursor pointers, and interactive focus styles */
  interactive?: boolean
  /** Marks a row as selected, applying a primary color highlight border */
  selected?: boolean
}

export type DataListItemProps = Prettify<DataListItemCustomProps> &
  React.HTMLAttributes<HTMLDivElement>

/**
 * DataListItem: An individual row component inside a DataList.
 * Automatically fetches layout presets from the parent DataListContext to style
 * padding, border radius, and animations.
 */
export const DataListItem = forwardRef<HTMLDivElement, DataListItemProps>(
  (props, ref) => {
    const {
      className,
      interactive = false,
      selected = false,
      children,
      ...rest
    } = props

    // Consume spacing and layout presets from parent DataList Context
    const { spacing, variant } = useContext(DataListContext)

    return (
      <div
        ref={ref}
        // role="listitem" establishes child semantics inside the role="list" wrapper
        role="listitem"
        className={cn(
          // BASE STYLES: Sets up alignment, flexbox container, and smooth interactive scale triggers
          'flex items-center justify-between transition-all animate-duration-normal outline-none',

          // DYNAMIC PADDING: Scales vertically based on the shared spacing preset
          spacing === 'compact' && 'p-s min-h-12',
          spacing === 'default' && 'p-m min-h-16',
          spacing === 'relaxed' && 'p-l min-h-20',

          // LAYOUT STYLE INTEGRATION:
          // Inset variant rounds corners and creates distinct boundaries
          variant === 'inset' && 'rounded-medium border border-transparent',
          variant === 'inset' &&
            interactive &&
            'hover:border-border-default hover:shadow-sm',

          // INTERACTIVE FOCUS STATES & TRANSITION CURVES:
          interactive &&
            'cursor-pointer hover:bg-surface-sunken active:scale-[0.995]',
          selected &&
            'bg-action-primary-subtle border-l-4 border-l-action-primary',

          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

DataListItem.displayName = 'DataListItem'
