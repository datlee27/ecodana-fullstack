import type { HTMLAttributes } from 'react';
import { cn } from '../utils';

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-soft text-green-800',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = ({ tone = 'neutral', size = 'sm', className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold leading-none',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
};
