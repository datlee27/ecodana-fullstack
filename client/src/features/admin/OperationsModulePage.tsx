import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, PageHeader, Skeleton } from '../../design-system';
import type { DataTableColumn } from '../../design-system';

interface OperationsModuleMetric {
  title: string;
  description: string;
}

interface OperationsModulePageProps<Row extends { id: string }> {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  summaryTitle: string;
  summaryDescription: string;
  metrics: OperationsModuleMetric[];
  queueTitle: string;
  queueDescription: string;
  columns: Array<DataTableColumn<Row>>;
  emptyTitle: string;
  emptyDescription: string;
}

export const OperationsModulePage = <Row extends { id: string }>({
  eyebrow,
  title,
  description,
  statusLabel,
  summaryTitle,
  summaryDescription,
  metrics,
  queueTitle,
  queueDescription,
  columns,
  emptyTitle,
  emptyDescription,
}: OperationsModulePageProps<Row>) => {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Badge tone="info" size="md">
            {statusLabel}
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{summaryTitle}</CardTitle>
          <CardDescription>{summaryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.title} className="rounded-xl border border-border bg-muted p-4">
              <p className="text-sm font-semibold text-text-strong">{metric.title}</p>
              <p className="mt-1 text-sm text-text-muted">{metric.description}</p>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{queueTitle}</CardTitle>
          <CardDescription>{queueDescription}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            rows={[]}
            getRowKey={(row) => row.id}
            emptyState={<EmptyState title={emptyTitle} description={emptyDescription} />}
          />
        </CardContent>
      </Card>
    </section>
  );
};
