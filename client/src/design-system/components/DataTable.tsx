import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { cn } from '../utils';

type DataTableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: DataTableAlign;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  emptyState?: ReactNode;
  className?: string;
  tableClassName?: string;
  rowClassName?: (row: T) => string | undefined;
}

const alignClassNames: Record<DataTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const DataTable = <T,>({
  columns,
  rows,
  getRowKey,
  emptyState,
  className,
  tableClassName,
  rowClassName,
}: DataTableProps<T>) => {
  if (rows.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <EmptyState title="Chua co du lieu" description="Noi dung se hien thi khi co ban ghi phu hop." />
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border bg-surface', className)}>
      <table className={cn('min-w-full divide-y divide-border text-sm', tableClassName)}>
        <thead className="bg-muted text-text-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 font-semibold',
                  alignClassNames[column.align ?? 'left'],
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={cn('align-top', rowClassName?.(row))}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-text-base',
                    alignClassNames[column.align ?? 'left'],
                    column.cellClassName,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
