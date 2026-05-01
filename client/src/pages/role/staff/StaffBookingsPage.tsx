import type { DataTableColumn } from '../../../design-system';
import { Badge } from '../../../design-system';
import { OperationsModulePage } from '../../../features/admin/OperationsModulePage';

interface StaffBookingRow {
  id: string;
  booking: string;
  queue: string;
  status: string;
}

const columns: Array<DataTableColumn<StaffBookingRow>> = [
  { key: 'booking', header: 'Booking', render: (row) => row.booking },
  { key: 'queue', header: 'Nhom xu ly', render: (row) => row.queue },
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

const StaffBookingsPage = () => {
  return (
    <OperationsModulePage
      eyebrow="Staff bookings"
      title="Xu ly booking"
      description="Shell staff cho cac booking can theo doi, can xac minh va can dieu phoi."
      statusLabel="Cho ket noi booking ops API"
      summaryTitle="Tong quan booking cho staff"
      summaryDescription="Bang dieu phoi nay se giup staff uu tien xu ly booking theo nhom viec."
      metrics={[
        { title: 'Cho xac minh', description: 'Booking can staff kiem tra truoc khi day tiep workflow.' },
        { title: 'Can can thiep', description: 'Truong hop can goi chu xe, khach hang hoac doi soat lai.' },
        { title: 'Canh bao tre', description: 'Booking ton dong can xu ly som trong ngay.' },
      ]}
      queueTitle="Danh sach booking"
      queueDescription="Bang compact cho staff booking operations va nhung case can can thiep."
      columns={columns}
      emptyTitle="Chua co du lieu booking staff"
      emptyDescription="Hang doi booking se hien thi tai day khi route staff duoc noi voi API van hanh."
    />
  );
};

export default StaffBookingsPage;
