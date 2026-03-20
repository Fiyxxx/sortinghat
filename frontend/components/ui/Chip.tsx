import React from 'react';

interface ChipProps {
  variant?: 'allocation' | 'status' | 'interactive';
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const variantClasses = {
  allocation: 'bg-tertiary-fixed text-on-tertiary-fixed',
  status: 'bg-surface-container-highest text-on-surface/80',
  interactive: {
    selected: 'bg-tertiary-fixed text-on-tertiary-fixed shadow-ghost-sm',
    unselected: 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
  },
};

export default function Chip({
  variant = 'status',
  selected = false,
  onClick,
  children,
  className = '',
  disabled = false,
}: ChipProps) {
  const baseClasses = 'rounded-full px-4 py-2 font-body text-label-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  let variantClass = '';
  if (variant === 'interactive') {
    variantClass = selected
      ? variantClasses.interactive.selected
      : variantClasses.interactive.unselected;
  } else {
    variantClass = variantClasses[variant];
  }

  const classes = [baseClasses, variantClass, onClick && 'cursor-pointer', className]
    .filter(Boolean)
    .join(' ');

  const Component = onClick ? 'button' : 'span';

  const buttonProps = Component === 'button' ? {
    type: 'button' as const,
    disabled,
    ...(variant === 'interactive' && { 'aria-pressed': selected }),
  } : {};

  return (
    <Component className={classes} onClick={onClick} {...buttonProps}>
      {children}
    </Component>
  );
}
