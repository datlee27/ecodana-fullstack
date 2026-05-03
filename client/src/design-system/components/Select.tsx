import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  wrapperClassName?: string;
  selectClassName?: string;
}

export const Select = ({
  id,
  label,
  hint,
  error,
  leftIcon,
  wrapperClassName,
  selectClassName,
  className,
  children,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const hasLeftIcon = Boolean(leftIcon);

  return (
    <div className={cn('space-y-1.5', wrapperClassName, className)}>
      {label ? (
        <label htmlFor={fieldId} className="block text-sm font-medium text-text-strong">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </span>
        ) : null}
        <select
          id={fieldId}
          className={cn(
            'block h-10 w-full appearance-none rounded-lg border bg-surface px-3 pr-10 text-sm text-text-strong shadow-sm transition-colors',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            hasLeftIcon && 'pl-10',
            error ? 'border-danger' : 'border-border',
            selectClassName,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
