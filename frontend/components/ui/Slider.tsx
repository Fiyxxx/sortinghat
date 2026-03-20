import React, { useId } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  gradient?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  showValue = false,
  valueFormatter,
  gradient = false,
  className = '',
  disabled = false,
}: SliderProps) {
  const inputId = useId();
  const range = max - min;
  const percentage = range === 0 ? 0 : ((value - min) / range) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="font-body text-label-md uppercase tracking-wide text-on-surface/60">
            {label}
          </label>
          {showValue && (
            <span className="font-display text-title-md text-primary">
              {valueFormatter ? valueFormatter(value) : value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 group">
        {/* Track */}
        <div className="absolute w-full h-2 bg-surface-container-high rounded-full" />
        {/* Filled track */}
        <div
          className={`absolute h-2 rounded-full ${gradient ? 'gradient-allocation' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Input */}
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          aria-valuetext={valueFormatter ? valueFormatter(value) : undefined}
          aria-label={!label ? 'Slider' : undefined}
          className="absolute w-full h-2 opacity-0 cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full shadow-ghost-sm pointer-events-none transition-transform group-hover:scale-110 group-focus-within:ring-2 group-focus-within:ring-primary group-focus-within:ring-offset-2"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  );
}
