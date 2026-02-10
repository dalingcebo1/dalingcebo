import { SelectHTMLAttributes } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  label: string
  options: SelectOption[]
  registration: UseFormRegisterReturn
  error?: string
  helperText?: string
  optionalText?: string
  placeholder?: string
  containerClassName?: string
  labelClassName?: string
}

export default function FormSelect({
  label,
  options,
  registration,
  error,
  helperText,
  optionalText,
  placeholder = 'Select an option',
  containerClassName = '',
  labelClassName = 'text-[10px] font-medium uppercase tracking-[0.2em]',
  className = '',
  id,
  ...rest
}: FormSelectProps) {
  const fieldId = id ?? registration.name
  const errorId = error ? `${fieldId}-error` : undefined
  const baseClasses = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all bg-white'
  const errorClasses = error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'

  return (
    <div className={containerClassName}>
      <label htmlFor={fieldId} className={`block mb-2 ${labelClassName}`}>
        {label}
        {optionalText && <span className="text-gray-400 normal-case ml-1">({optionalText})</span>}
      </label>
      <select
        id={fieldId}
        {...registration}
        {...rest}
        className={`${baseClasses} ${errorClasses} ${className}`.trim()}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )}
