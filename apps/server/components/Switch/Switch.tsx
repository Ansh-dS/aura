import React, { forwardRef, useState } from 'react'
import { switchVariants, SwitchVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SwitchCustomProps = {
  checked?: boolean
  label?: string
  checkedBg?: string
  uncheckedBg?: string
}

type CleanProps = Prettify<SwitchCustomProps & SwitchVariantsType>

export type SwitchProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'>

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (props, ref) => {
    const {
      size,
      className,
      checked: controlledChecked,
      defaultChecked,
      label,
      checkedBg = 'bg-action-primary',
      uncheckedBg = 'bg-surface-overlay',
      onChange,
      onClick,
      ...rest
    } = props

    // Internal state for uncontrolled mode (when `checked` is not provided)
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false
    )

    // Controlled if `checked` prop is explicitly provided, otherwise uncontrolled
    const isControlled = controlledChecked !== undefined
    const isChecked = isControlled ? controlledChecked : internalChecked

    return (
      <label className="flex items-center gap-m cursor-pointer">
        {/* Hidden native checkbox — ref forwarded here for react-hook-form */}
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={(e) => {
            if (!isControlled) {
              setInternalChecked(e.target.checked)
            }
            // Forward to react-hook-form's onChange or any custom handler
            onChange?.(e)
          }}
          onClick={onClick}
          {...rest}
        />
        {/* Visual toggle track */}
        <span
          role="switch"
          aria-checked={isChecked}
          className={cn(
            switchVariants({ size }),
            isChecked ? checkedBg : uncheckedBg,
            className
          )}
        >
          {/* Thumb */}
          <span
            className={cn(
              'bg-white rounded-full transition-transform shadow-sm',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
              isChecked
                ? size === 'sm'
                  ? 'translate-x-4'
                  : size === 'lg'
                    ? 'translate-x-6'
                    : 'translate-x-5'
                : 'translate-x-0'
            )}
          />
        </span>
        {label && (
          <Text as="span" className="select-none">
            {label}
          </Text>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
