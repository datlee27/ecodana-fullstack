import type { DataTableColumn } from '../../../design-system';
import { Badge } from '../../../design-system';
import { OperationsModulePage } from '../../../features/admin/OperationsModulePage';

interface StaffVehicleApprovalRow {
  id: string;
  vehicle: string;
  owner: string;
  status: string;
}

const columns: Array<DataTableColumn<StaffVehicleApprovalRow>> = [
  { key: 'vehicle', header: 'Ho so xe', render: (row) => row.vehicle },
  { key: 'owner', header: 'Chu xe', render: (row) => row.owner },
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

const StaffVehicleApprovalsPage = () => {
  return (
    <OperationsModulePage
      eyebrow="Staff vehicle approvals"
      title="Kiem duyet phuong tien"
      description="Shell staff cho viec soat ho so, hinh anh va giay to truoc khi chuyen len admin."
      statusLabel="Cho ket noi vehicle review API"
      summaryTitle="Tong quan kiem duyet"
      summaryDescription="Khoi thong tin se phan tach ho so moi, can bo sung va can xac minh lai."
      metrics={[
        { title: 'Ho so moi', description: 'Xe moi nop can staff kiem tra thong tin nen tang.' },
        { title: 'Can bo sung', description: 'Ho so chua day du can staff gui lai owner.' },
        { title: 'Can xac minh lai', description: 'Tai lieu hoac hinh anh can doi chieu them.' },
      ]}
      queueTitle="Danh sach ho so xe"
      queueDescription="Bang compact cho staff xu ly tung nhom ho so truoc khi nang cap len admin."
      columns={columns}
      emptyTitle="Chua co du lieu ho so xe"
      emptyDescription="Danh sach kiem duyet xe se hien thi tai day khi staff API duoc ket noi."
    />
  );
};

export default StaffVehicleApprovalsPage;
