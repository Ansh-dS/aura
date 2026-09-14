import React, { forwardRef } from 'react'
import { radioVariants, RadioVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Custom props for the Radio component.
 */
type RadioCustomProps = {
  /**
   * The text label to display next to the radio button.
   * Clicking the label will toggle the radio input.
   */
  label?: string
}

type CleanProps = Prettify<RadioCustomProps & RadioVariantsType>

/**
 * RadioProps combines native input attributes with custom variants.
 * Omit standard HTML attributes that clash with our variants (size, color).
 */
export type RadioProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'color'>

/**
 * Radio component allows the user to select one option from a set.
 * Designed with UX best practices including Fitts's Law minimum touch targets.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  const { color, className, label, size, variant, ...rest } = props
  return (
    <label className="flex items-center gap-s cursor-pointer min-h-[44px] min-w-[44px]">
      <input
        ref={ref}
        type="radio"
        className={cn(radioVariants({ color, size, variant }), className)}
        {...rest}
      />
      {label && (
        <Text as="span" className="text-body text-fg-primary select-none">
          {label}
        </Text>
      )}
    </label>
  )
})

Radio.displayName = 'Radio'
