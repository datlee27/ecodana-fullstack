import { useEffect, useState } from 'react';
import { deleteOwnerVehicle, getOwnerApiErrorMessage, getOwnerMeta, getOwnerVehicles, updateOwnerVehicleStatus } from '../../../api/ownerApi';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { AddVehicleModal } from '../../../features/vehicle/AddVehicleModal';
import { EditVehicleModal } from '../../../features/vehicle/EditVehicleModal';
import { useNotification } from '../../../hooks/useNotification';
import type { OwnerVehicle, OwnerVehicleMeta } from '../../../types/owner';

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

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Car Management</h1>
          <p className="text-sm text-slate-600">Quan ly danh sach xe, cap nhat thong tin va trang thai.</p>
        </div>
        <AddVehicleModal
          meta={meta}
          onCreated={(vehicle) => {
            setVehicles((prev) => [vehicle, ...prev]);
          }}
        />
      </div>

      {vehicles.length === 0 ? (
        <EmptyState message="Ban chua co xe nao. Hay them xe dau tien." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">License</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Price/Day</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td className="px-4 py-3 text-slate-800">{vehicle.vehicleModel}</td>
                  <td className="px-4 py-3 text-slate-700">{vehicle.licensePlate || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">{vehicle.vehicleType}</td>
                  <td className="px-4 py-3 text-slate-700">{new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice)} đ</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <EditVehicleModal
                        vehicle={vehicle}
                        meta={meta}
                        onSaved={(updatedVehicle) => {
                          setVehicles((prev) =>
                            prev.map((item) => (item.vehicleId === updatedVehicle.vehicleId ? updatedVehicle : item)),
                          );
                        }}
                      />
                      <button
                        type="button"
                        disabled={processingId === vehicle.vehicleId}
                        onClick={() => void onToggleAvailability(vehicle)}
                        className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {vehicle.status === 'Available' ? 'Set Unavailable' : 'Set Available'}
                      </button>
                      <button
                        type="button"
                        disabled={processingId === vehicle.vehicleId}
                        onClick={() => setDeleteTarget(vehicle)}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xoa xe"
        message={
          deleteTarget
            ? `Ban co chac chan muon xoa xe ${deleteTarget.vehicleModel} (${deleteTarget.licensePlate || 'N/A'})?`
            : ''
        }
        confirmLabel="Xoa xe"
        cancelLabel="Huy"
        tone="danger"
        busy={deleteTarget ? processingId === deleteTarget.vehicleId : false}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onDelete()}
      />
    </section>
  );
};

export default OwnerVehicleListPage;
