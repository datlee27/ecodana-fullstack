import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, PageHeader, Skeleton } from '../../../design-system';
import type { DataTableColumn } from '../../../design-system';

interface StaffQueueItem {
  id: string;
  category: string;
  priority: string;
  status: string;
}

const queueColumns: Array<DataTableColumn<StaffQueueItem>> = [
  { key: 'category', header: 'Nhom viec', render: (row) => row.category },
  { key: 'priority', header: 'Uu tien', render: (row) => row.priority, align: 'right' },
  {
    key: 'status',
    header: 'Trang thai',
    render: (row) => (
      <Badge tone="neutral" size="md">
        {row.status}
      </Badge>
    ),
  },
];

const StaffDashboardPage = () => {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Staff portal"
        title="Bang dieu phoi nhan su"
        description="Shell staff de quan sat cac cong viec can xu ly trong ngay ma khong dua du lieu mau vao giao dien."
        actions={<Badge tone="info" size="md">Cho dong bo API</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {['Kiem tra ho so xe', 'Xu ly booking cho duyet', 'Doi soat phan hoi khach hang'].map((title) => (
          <Card key={title}>
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>Khoi thong tin se nhan du lieu that sau khi workflow staff duoc ket noi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sach cong viec</CardTitle>
          <CardDescription>DataTable compact de staff xu ly theo nhom cong viec va muc uu tien.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            columns={queueColumns}
            rows={[]}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="Chua co cong viec cho staff"
                description="Hang doi se hien thi tai day khi route staff duoc noi voi API van hanh."
              />
            }
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default StaffDashboardPage;
