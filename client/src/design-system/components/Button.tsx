import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary',
  secondary: 'bg-secondary text-white hover:bg-blue-700 focus-visible:ring-secondary',
  outline: 'border border-border bg-surface text-text-strong hover:bg-muted focus-visible:ring-primary',
  ghost: 'bg-transparent text-text-base hover:bg-muted focus-visible:ring-primary',
  danger: 'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
      {children}
      {!loading ? rightIcon : null}
    </button>
  );
};
