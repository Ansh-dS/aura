import React, { forwardRef, createContext, useContext } from 'react'
import {
  breadcrumbContainerVariants,
  breadcrumbLinkVariants,
  BreadcrumbLinkVariantsType,
} from './styles'
import { cn } from '../Utils/utils'
import { ChevronRight } from 'lucide-react'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/* -------------------------------------------------------------------------- */
/* CONTEXT (Context-based Variant Propagation)                                */
/* -------------------------------------------------------------------------- */
type BreadcrumbContextValue = {
  variant?: BreadcrumbLinkVariantsType['variant']
  size?: BreadcrumbLinkVariantsType['size']
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  variant: 'default',
  size: 'md',
})

/* -------------------------------------------------------------------------- */
/* BREADCRUMB CONTAINER (<Breadcrumb>)                                        */
/* -------------------------------------------------------------------------- */
type BreadcrumbProps = Prettify<
  React.HTMLAttributes<HTMLElement> & BreadcrumbContextValue
>

/**
 * Breadcrumb Wrapper: Renders a semantic navigation landmark wrapper.
 * Propagates variant and size configs to child links using a Context Provider.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (props, ref) => {
    const {
      className,
      variant = 'default',
      size = 'md',
      children,
      ...rest
    } = props

    return (
      <BreadcrumbContext.Provider value={{ variant, size }}>
        {/* semantic <nav> element with aria-label identifies this landmark to screen readers */}
        <nav ref={ref} aria-label="breadcrumb" className={className} {...rest}>
          {/* Ordered list groups sequential navigational segments */}
          <ol className={cn(breadcrumbContainerVariants({ size }))}>
            {children}
          </ol>
        </nav>
      </BreadcrumbContext.Provider>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB ITEM (<BreadcrumbItem>)                                         */
/* -------------------------------------------------------------------------- */
export type BreadcrumbItemProps = React.HTMLAttributes<HTMLLIElement>

/**
 * BreadcrumbItem: A wrapper for individual breadcrumb nodes.
 * Renders a list item (`<li>`) inside the parent `<ol>`.
 */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { className, ...rest } = props
    return (
      <li
        ref={ref}
        className={cn('inline-flex items-center', className)}
        {...rest}
      />
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB LINK (<BreadcrumbLink>)                                         */
/* -------------------------------------------------------------------------- */
type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLElement> & {
  /** Mark as the active/current page. Replaces link with a span element. */
  isCurrentPage?: boolean
  /** Custom wrapper component override (e.g. Next.js Link, React Router Link) */
  as?: React.ElementType
  /** Router pathway link target (e.g., for React Router Link) */
  to?: string
}

/*
we are providing two ways to enter a link prop:
    1. href (Native HTML / Next.js)
    2. to (React Router)
 */
export const BreadcrumbLink = forwardRef<HTMLElement, BreadcrumbLinkProps>(
  (props, ref) => {
    const {
      className,
      isCurrentPage = false,
      as: Component,
      to,
      href,
      children,
      ...rest
    } = props

    // Consume parent styling variants from Context
    const { variant, size } = useContext(BreadcrumbContext)

    /* 
      1. changing the component type with whatever we pass in "as".
          it could be a "anchor" tag, a "Link" commpoenent etc etc. 
    */
    let FinalComponent: React.ElementType =
      Component || (to || href ? 'a' : 'span')
    if (isCurrentPage) FinalComponent = 'span'

    /* 
      Storing a key value pair of to/herf and path:
        example
         to: "./forms"
         href: "./forms"
    */
    const routingProps: Record<string, unknown> = {}

    if (FinalComponent === 'a') {
      routingProps.href = href || to
    } else if (FinalComponent !== 'span') {
      if (to) routingProps.to = to
      if (href) routingProps.href = href
    }

    return (
      <FinalComponent
        ref={ref}
        // Identifies the active page within the navigation chain to screen readers
        aria-current={isCurrentPage ? 'page' : undefined}
        className={cn(
          breadcrumbLinkVariants({ variant, size, isCurrentPage }),
          className
        )}
        {...routingProps}
        {...rest}
      >
        {children}
      </FinalComponent>
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB SEPARATOR (<BreadcrumbSeparator>)                               */
/* -------------------------------------------------------------------------- */
export type BreadcrumbSeparatorProps = React.HTMLAttributes<HTMLSpanElement>

/**
 * BreadcrumbSeparator: Decorative separator character or icon placed between segments.
 * Explicitly hidden from assistive technologies.
 */
export const BreadcrumbSeparator = forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>((props, ref) => {
  const { children, className, ...rest } = props
  const { size } = useContext(BreadcrumbContext)

  return (
    <span
      ref={ref}
      // role="presentation" & aria-hidden="true" instruct screen readers to ignore the element
      role="presentation"
      aria-hidden="true"
      className={cn(
        'text-fg-tertiary flex items-center justify-center select-none',
        size === 'sm'
          ? '[&>svg]:w-3 [&>svg]:h-3 mx-0.5'
          : '[&>svg]:w-4 [&>svg]:h-4 mx-1',
        className
      )}
      {...rest}
    >
      {children ?? <ChevronRight />}
    </span>
  )
})
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'
