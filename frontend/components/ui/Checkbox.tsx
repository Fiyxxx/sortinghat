import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Checkbox({
  label,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <label className={`flex items-start gap-3 group ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className="peer sr-only"
          aria-label={label ? undefined : (props['aria-label'] || 'Checkbox')}
          {...props}
        />
        <div className="w-5 h-5 bg-surface-container-lowest ghost-border rounded-sm transition-all duration-200 peer-checked:bg-primary peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/20 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed group-hover:scale-105 peer-checked:[&_svg]:opacity-100">
          <svg
            className="w-5 h-5 text-on-primary opacity-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      {label && (
        <span className="font-body text-body-lg text-on-surface">
          {label}
        </span>
      )}
    </label>
  );
}
