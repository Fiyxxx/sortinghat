import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}: SelectProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helperTextId = helperText && !error ? `${id}-helper` : undefined;
  const describedBy = errorId || helperTextId;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block font-body text-label-md uppercase tracking-wide text-on-surface/60">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={props.required}
        className={[
          'w-full bg-surface-container-lowest px-4 py-3 font-body text-body-lg text-on-surface',
          'ghost-border-bottom transition-all duration-200',
          'focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'appearance-none bg-no-repeat bg-right pr-10',
          error && 'border-error',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23191c1d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="font-body text-body-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="font-body text-body-sm text-on-surface/60">{helperText}</p>
      )}
    </div>
  );
}
