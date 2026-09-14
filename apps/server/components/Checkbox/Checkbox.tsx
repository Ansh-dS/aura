import React from 'react'
import { Check } from 'lucide-react'
import { checkboxVariants, CheckboxVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type CheckboxCustomProps = {
  label?: string
}

type CleanProps = Prettify<CheckboxCustomProps & CheckboxVariantsType>

export type CheckboxProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'>

export function Checkbox(props: CheckboxProps): React.ReactElement {
  const {
    color = 'primary',
    size = 'md',
    variant = 'solid',
    className,
    label,
    ...rest
  } = props
  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <label className="inline-flex items-center gap-s cursor-pointer select-none">
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          className={cn(
            checkboxVariants({ color, size, variant }),
            'peer',
            className
          )}
          {...rest}
        />
        <Check
          strokeWidth={3}
          className={cn(
            'pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100',
            iconSizeClass
          )}
        />
      </div>
      {label && <Text as="span">{label}</Text>}
    </label>
  )
}
