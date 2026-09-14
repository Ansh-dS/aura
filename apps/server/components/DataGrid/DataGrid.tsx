import React, { forwardRef, createContext, useContext } from 'react'
import { dataGridVariants, DataGridVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * DataGridContext allows sub-components (like DataGridHead and DataGridCell)
 * to access the global grid configuration (like 'size') without prop drilling.
 */
const DataGridContext = createContext<{
  size?: 'sm' | 'md' | 'lg' | null | undefined
}>({
  size: 'md',
})

/**
 * Checks if a component type corresponds to a standard native HTML table section tag.
 */
const isNativeTableSection = (type: unknown): boolean => {
  return (
    typeof type === 'string' &&
    (type === 'caption' ||
      type === 'colgroup' ||
      type === 'thead' ||
      type === 'tbody' ||
      type === 'tfoot')
  )
}

/**
 * Checks if a given React node is a valid table section component,
 * either a native tag (thead, tbody, tfoot) or one of our custom DataGrid wrappers.
 */
const isDataGridSection = (node: React.ReactNode): boolean => {
  if (!React.isValidElement(node)) {
    return false
  }

  const { type } = node

  return (
    isNativeTableSection(type) ||
    type === DataGridHeader ||
    type === DataGridBody ||
    type === DataGridFooter
  )
}

/**
 * Normalization helper: Ensures children are properly nested within standard HTML structure.
 * If a developer places <DataGridRow> elements directly inside <DataGrid>, this function
 * automatically wraps those orphaned rows into a <DataGridBody> wrapper.
 */
const normalizeTableChildren = (children: React.ReactNode): React.ReactNode => {
  // React.Children.toArray automatically flattens Fragment wrappers one level deep
  const nodes = React.Children.toArray(children)

  if (nodes.length === 0) return children

  const normalized: React.ReactNode[] = []
  let pendingBodyNodes: React.ReactNode[] = []

  // Helper to wrap any accumulated free-floating rows into a DataGridBody block
  const flush = (keyIndex: number) => {
    if (pendingBodyNodes.length > 0) {
      normalized.push(
        <DataGridBody key={`auto-tbody-${keyIndex}`}>
          {pendingBodyNodes}
        </DataGridBody>
      )
      pendingBodyNodes = []
    }
  }

  nodes.forEach((node, index) => {
    if (isDataGridSection(node)) {
      // If we encounter a valid section header/body/footer, flush accumulated rows first
      flush(index)
      normalized.push(node)
    } else {
      // Collect non-section nodes (typically rows or cells) to wrap them inside a body
      pendingBodyNodes.push(node)
    }
  })

  // Flush any remaining trailing rows
  flush(nodes.length)
  return normalized
}

type CleanProps = Prettify<DataGridVariantsType>

export type DataGridProps = CleanProps &
  React.TableHTMLAttributes<HTMLTableElement>

/**
 * DataGrid Component
 * Represents the root wrapper of the table. Handles horizontal scrolling,
 * rounded corners, and consistent sizing configuration.
 */
export const DataGrid = forwardRef<HTMLTableElement, DataGridProps>(
  (props, ref) => {
    const { className, size, children, ...rest } = props
    /* why we wrap 'div' around the table?
       a. table fits according to the content even it break the layout. 
       b. element cannot show rounded corners.
       c. The wrapper div acts as the reference point. Without it, your sticky header might stick to the top of the entire browser window
    */

    return (
      <DataGridContext.Provider value={{ size }}>
        <div className="w-full overflow-x-auto rounded-large border border-border-default bg-surface-base">
          <table
            ref={ref}
            // Added w-full so the table actually stretches to fill the wrapper
            className={cn(
              'w-full text-left',
              dataGridVariants({ size }),
              className
            )}
            {...rest}
          >
            {normalizeTableChildren(children)}
          </table>
        </div>
      </DataGridContext.Provider>
    )
  }
)
DataGrid.displayName = 'DataGrid'

// Helper sub-components for the grid
// HTMLableSectionElement: following examples of element it contains '<tbody>, <thead>, <tfoot>...'
// React.HTMLAttributes<HTMLTableSectionElement>: These are the respective types.

/**
 * DataGridHeader Component
 * Represents the table header container (<thead>). Applies a sunken background
 * and subtle bottom border.
 */
export const DataGridHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-surface-sunken border-b border-border-default',
      className
    )}
    {...props}
  />
))
DataGridHeader.displayName = 'DataGridHeader'

/**
 * DataGridBody Component
 * Represents the primary body container (<tbody>). Houses the grid rows.
 */
export const DataGridBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
))
DataGridBody.displayName = 'DataGridBody'

/**
 * DataGridFooter Component
 * Represents the bottom pagination or summary bar container (<tfoot>).
 */
export const DataGridFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-border-default', className)}
    {...props}
  />
))
DataGridFooter.displayName = 'DataGridFooter'

// data-grid-row: each row of table.

/**
 * DataGridRow Component
 * Houses cells within a single row. Automatically applies hover background effects
 * and handles custom states (like selected).
 */
export const DataGridRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  /* bg-surface-sunken/50: set opacity of the given color to 50 */
  <tr
    ref={ref}
    className={cn(
      'border-b border-border-default transition-colors',
      'hover:bg-action-ghost-hover',
      'data-[state=selected]:bg-action-primary-subtle',
      className
    )}
    {...props}
  />
))
DataGridRow.displayName = 'DataGridRow'

// data-grid-head: styles for the head box.

/**
 * DataGridHead Component
 * Represents the column header cell (<th>). Adjusts font scales, spacing,
 * and height according to the grid size.
 */
export const DataGridHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { size } = useContext(DataGridContext)

  /* THE TYPOGRAPHIC & GEOMETRIC SCALE:
      sm: 10 units high | Caption text
      md: 14 units high | Label text (Perfectly balanced for Tally)
      lg: 20 units high | Body text (High impact for Riverside)
   */

  const sizeClasses = {
    /** Gives enough room for the 8px cell padding */
    sm: 'h-10 px-m text-caption',
    md: 'h-12 px-l text-label',
    lg: 'h-14 px-2xl text-body',
  }

  return (
    <th
      ref={ref}
      className={cn(
        'text-left align-middle font-weight-semibold text-fg-secondary uppercase tracking-wide',
        sizeClasses[size || 'md'],
        className
      )}
      {...props}
    />
  )
})
DataGridHead.displayName = 'DataGridHead'

// data-gird-cell: Each cell.

/**
 * DataGridCell Component
 * Represents standard table data cells (<td>). Automatically scales margins,
 * optical row heights, and text sizing based on the configured grid size.
 */
export const DataGridCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { size } = useContext(DataGridContext)

  // Map the broadcasted size to specific Tailwind padding/text classes
  // FIX: Dynamically changing px/py for better optical row height based on grid size.
  // FIX: Dynamically changing text size (caption vs body vs subheader)

  /* THE "UI-SAFE" ASYMMETRIC SCALE:
     sm: py-s (8px)  | px-m (12px) -> Tight, but safe for Badges/Avatars.
     md: py-m (12px) | px-l (16px) -> The Tally Default.
     lg: py-l (16px) | px-2xl(32px)-> Premium breathing room.
  */
  const sizeClasses = {
    sm: 'py-s px-m text-caption',
    md: 'py-m px-l text-body',
    lg: 'py-l px-2xl text-subheader',
  }

  return (
    <td
      ref={ref}
      // FIX: Changed p-l to px-l py-m for better optical row height.
      // FIX: Changed text-fg-primary to a text-body
      className={cn(
        'align-middle text-fg-primary',
        sizeClasses[size || 'md'],
        className
      )}
      {...props}
    />
  )
})
DataGridCell.displayName = 'DataGridCell'
