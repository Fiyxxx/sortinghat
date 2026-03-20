import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 'lowest' | 'low' | 'default' | 'high' | 'highest';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  shadow?: boolean;
  children: React.ReactNode;
  className?: string;
}

const surfaceClasses = {
  lowest: 'bg-surface-container-lowest',
  low: 'bg-surface-container-low',
  default: 'bg-surface-container',
  high: 'bg-surface-container-high',
  highest: 'bg-surface-container-highest',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export default function Card({
  surface = 'default',
  padding = 'md',
  rounded = 'xl',
  shadow = false,
  children,
  className = '',
  ...rest
}: CardProps) {
  const classes = [
    surfaceClasses[surface],
    paddingClasses[padding],
    roundedClasses[rounded],
    shadow && 'shadow-ghost',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} {...rest}>{children}</div>;
}
