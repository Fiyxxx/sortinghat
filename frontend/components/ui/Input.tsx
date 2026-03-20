import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
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
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={props.required}
        className={[
          'w-full bg-surface-container-lowest px-4 py-3 font-body text-body-lg text-on-surface',
          'ghost-border-bottom transition-all duration-200',
          'focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} className="font-body text-body-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="font-body text-body-sm text-on-surface/60">{helperText}</p>
      )}
    </div>
  );
}
