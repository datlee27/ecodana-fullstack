import { useEffect, useState } from 'react';
import { deleteOwnerVehicle, getOwnerApiErrorMessage, getOwnerMeta, getOwnerVehicles, updateOwnerVehicleStatus } from '../../../api/ownerApi';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { Badge, Button, ConfirmDialog, DataTable, EmptyState, PageHeader } from '../../../design-system';
import type { DataTableColumn } from '../../../design-system/components/DataTable';
import { AddVehicleModal } from '../../../features/vehicle/AddVehicleModal';
import { EditVehicleModal } from '../../../features/vehicle/EditVehicleModal';
import { useNotification } from '../../../hooks/useNotification';
import type { OwnerVehicle, OwnerVehicleMeta } from '../../../types/owner';

const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} d`;

const getVehicleStatusTone = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return 'success' as const;
    case 'UNAVAILABLE':
      return 'warning' as const;
    case 'MAINTENANCE':
      return 'info' as const;
    case 'PENDINGAPPROVAL':
      return 'warning' as const;
    case 'REJECTED':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
};

const OwnerVehicleListPage = () => {
  const { success, error: notifyError } = useNotification();
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [meta, setMeta] = useState<OwnerVehicleMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerVehicle | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehicleData, metaData] = await Promise.all([getOwnerVehicles(), getOwnerMeta()]);
      setVehicles(vehicleData);
      setMeta(metaData);
    } catch {
      setError('Khong the tai danh sach xe owner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onDelete = async () => {
    if (!deleteTarget) return;

    setProcessingId(deleteTarget.vehicleId);
    try {
      await deleteOwnerVehicle(deleteTarget.vehicleId);
      setVehicles((prev) => prev.filter((vehicle) => vehicle.vehicleId !== deleteTarget.vehicleId));
      success('Da xoa xe thanh cong.');
      setDeleteTarget(null);
    } catch (apiError) {
      notifyError(getOwnerApiErrorMessage(apiError, 'Khong the xoa xe. Vui long thu lai.'));
    } finally {
      setProcessingId(null);
    }
  };

  const onToggleAvailability = async (vehicle: OwnerVehicle) => {
    const nextStatus = vehicle.status === 'Available' ? 'Unavailable' : 'Available';
    setProcessingId(vehicle.vehicleId);
    try {
      await updateOwnerVehicleStatus(vehicle.vehicleId, nextStatus);
      setVehicles((prev) =>
        prev.map((item) =>
          item.vehicleId === vehicle.vehicleId
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );
      success('Da cap nhat trang thai xe.');
    } catch (apiError) {
      notifyError(getOwnerApiErrorMessage(apiError, 'Khong the cap nhat trang thai xe.'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Dang tai danh sach xe..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadData()} />;
  }

  const columns: Array<DataTableColumn<OwnerVehicle>> = [
    {
      key: 'model',
      header: 'Model',
      render: (vehicle) => <span className="font-semibold text-text-strong">{vehicle.vehicleModel}</span>,
    },
    {
      key: 'license',
      header: 'Bien so',
      render: (vehicle) => vehicle.licensePlate || 'Chua cap nhat',
    },
    {
      key: 'type',
      header: 'Loai xe',
      render: (vehicle) => vehicle.vehicleType,
    },
    {
      key: 'price',
      header: 'Gia/ngay',
      align: 'right',
      render: (vehicle) => <span className="font-semibold text-text-strong">{formatCurrency(vehicle.dailyPrice)}</span>,
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (vehicle) => (
        <Badge tone={getVehicleStatusTone(vehicle.status)} size="md">
          {vehicle.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tac',
      align: 'right',
      headerClassName: 'w-[18rem]',
      render: (vehicle) => (
        <div className="flex justify-end gap-2">
          <EditVehicleModal
            vehicle={vehicle}
            meta={meta}
            onSaved={(updatedVehicle) => {
              setVehicles((prev) => prev.map((item) => (item.vehicleId === updatedVehicle.vehicleId ? updatedVehicle : item)));
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={processingId === vehicle.vehicleId}
            onClick={() => void onToggleAvailability(vehicle)}
          >
            {vehicle.status === 'Available' ? 'Tam dung' : 'Mo lai'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={processingId === vehicle.vehicleId}
            onClick={() => setDeleteTarget(vehicle)}
          >
            Xoa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Owner portal"
        title="Quan ly xe"
        description="Danh sach xe, gia cho thue va trang thai san sang trong owner portal."
        actions={
          <AddVehicleModal
            meta={meta}
            onCreated={(vehicle) => {
              setVehicles((prev) => [vehicle, ...prev]);
            }}
          />
        }
      />

      {vehicles.length === 0 ? (
        <EmptyState
          title="Ban chua co xe nao"
          description="Hay them xe dau tien de bat dau nhan booking tu khach thue."
          action={
            <AddVehicleModal
              meta={meta}
              onCreated={(vehicle) => {
                setVehicles((prev) => [vehicle, ...prev]);
              }}
            />
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={vehicles}
          getRowKey={(vehicle) => vehicle.vehicleId}
          emptyState={<EmptyState title="Ban chua co xe nao" description="Hay them xe dau tien de bat dau nhan booking tu khach thue." />}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xoa xe"
        description={
          deleteTarget
            ? `Hanh dong nay se go xe ${deleteTarget.vehicleModel} (${deleteTarget.licensePlate || 'Chua cap nhat'}) khoi danh sach cua ban.`
            : undefined
        }
        confirmLabel="Xoa xe"
        cancelLabel="Huy"
        tone="danger"
        busy={deleteTarget ? processingId === deleteTarget.vehicleId : false}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onDelete()}
      >
        <p className="text-sm leading-6 text-text-base">
          Ban van co the them lai xe sau nay, nhung trang thai hien tai va cac thay doi chua luu se khong duoc giu lai.
        </p>
      </ConfirmDialog>
    </section>
  );
};

export default OwnerVehicleListPage;
