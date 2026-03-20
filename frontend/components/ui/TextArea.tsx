import React, { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function TextArea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextAreaProps) {
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
      <textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={props.required}
        className={[
          'w-full bg-surface-container-lowest px-4 py-3 font-body text-body-lg text-on-surface',
          'ghost-border transition-all duration-200 resize-y min-h-[120px]',
          'focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} className="font-body text-body-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="font-body text-body-sm text-on-surface/60">{helperText}</p>
      )}
    </div>
  );
}
