import type { DataTableColumn } from '../../../design-system';
import { Badge } from '../../../design-system';
import { OperationsModulePage } from '../../../features/admin/OperationsModulePage';

interface StaffOperationRow {
  id: string;
  stream: string;
  priority: string;
  status: string;
}

const columns: Array<DataTableColumn<StaffOperationRow>> = [
  { key: 'stream', header: 'Luong cong viec', render: (row) => row.stream },
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

const StaffOperationsPage = () => {
  return (
    <OperationsModulePage
      eyebrow="Staff operations"
      title="Dieu phoi van hanh"
      description="Shell staff cho nhung luong cong viec can theo doi hang ngay ma khong dua du lieu gia vao giao dien."
      statusLabel="Cho ket noi ops API"
      summaryTitle="Tong quan cong viec"
      summaryDescription="Khoi thong tin nay se gom cac stream cong viec can uu tien trong ngay."
      metrics={[
        { title: 'Cong viec moi', description: 'Su kien moi can staff tiep nhan hoac chuyen tiep.' },
        { title: 'Can xac minh', description: 'Luot xu ly can doi chieu thong tin hoac tai lieu.' },
        { title: 'Canh bao SLA', description: 'Cong viec ton dong co nguy co tre han.' },
      ]}
      queueTitle="Bang dieu phoi"
      queueDescription="Bang compact cho staff tong hop cong viec va phan bo uu tien."
      columns={columns}
      emptyTitle="Chua co du lieu dieu phoi"
      emptyDescription="Bang dieu phoi staff se hien thi tai day khi route operations duoc ket noi."
    />
  );
};

export default StaffOperationsPage;
