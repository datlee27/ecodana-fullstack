import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
}

export const Input = ({
  id,
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  wrapperClassName,
  inputClassName,
  className,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);

  return (
    <div className={cn('space-y-1.5', wrapperClassName, className)}>
      {label ? (
        <label htmlFor={fieldId} className="block text-sm font-medium text-text-strong">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{leftIcon}</span> : null}
        <input
          id={fieldId}
          className={cn(
            'block h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text-strong shadow-sm transition-colors',
            'placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            error ? 'border-danger' : 'border-border',
            hasLeftIcon && 'pl-10',
            hasRightIcon && 'pr-10',
            inputClassName,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {rightIcon ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{rightIcon}</span> : null}
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
