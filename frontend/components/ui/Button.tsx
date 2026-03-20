import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(149,73,0,0.1)] active:scale-[0.98]',
  secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-light active:scale-[0.98]',
  tertiary: 'bg-transparent text-primary hover:bg-surface-container-high active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-body-lg',
  lg: 'px-8 py-4 text-title-md',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'rounded-md font-body font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    disabled && 'disabled:bg-surface-container-high disabled:text-on-surface/40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
