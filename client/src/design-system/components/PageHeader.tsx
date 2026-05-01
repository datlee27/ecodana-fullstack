import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-text-strong sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-text-muted sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
