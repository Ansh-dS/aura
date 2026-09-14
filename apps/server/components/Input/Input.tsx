import React from 'react'
import { inputVariants, InputVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// We omit 'size' from the native HTML attributes so our CVA 'size' variant can take over.
type InputCustomProps = {
  error?: string | boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

type CleanProps = Prettify<InputCustomProps & InputVariantsType>

export type InputProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>

export function Input(props: InputProps): React.ReactElement {
  const { variant, size, className, error, startIcon, endIcon, ...rest } = props

  return (
    <div className="w-full relative flex items-center">
      {startIcon && (
        <div className="absolute left-m text-fg-secondary pointer-events-none">
          {startIcon}
        </div>
      )}
      <input
        aria-invalid={!!error}
        className={cn(
          inputVariants({ variant, size }),
          error && 'border-status-danger focus:border-status-danger',
          startIcon && 'pl-xl', // Adds padding to prevent text from overlapping the icon
          endIcon && 'pr-xl',
          className
        )}
        {...rest}
      />
      {endIcon && (
        <div className="absolute right-m text-fg-secondary pointer-events-none">
          {endIcon}
        </div>
      )}
    </div>
  )
}
