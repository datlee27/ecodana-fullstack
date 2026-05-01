import type { HTMLAttributes } from 'react';
import { cn } from '../utils';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} aria-hidden="true" {...props} />;
};
