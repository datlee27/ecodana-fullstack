import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('rounded-xl border border-border bg-surface shadow-sm', className)} {...props} />;
};

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('space-y-1.5 border-b border-border px-5 py-4', className)} {...props} />;
};

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
  return <h3 className={cn('text-lg font-semibold text-text-strong', className)} {...props} />;
};

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />;
};

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('px-5 py-4', className)} {...props} />;
};

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-border bg-muted px-5 py-3', className)} {...props}>
      {children}
    </div>
  );
};
