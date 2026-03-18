import { useMemo, useState } from 'react';
import { createOwnerVehicle } from '../../api/ownerApi';
import { useNotification } from '../../hooks/useNotification';
import type { OwnerVehicle, OwnerVehicleMeta, OwnerVehiclePayload } from '../../types/owner';

interface AddVehicleModalProps {
  meta?: OwnerVehicleMeta | null;
  onCreated?: (vehicle: OwnerVehicle) => void;
}

const toStringList = (raw: string): string[] =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const createInitialForm = (meta?: OwnerVehicleMeta | null): OwnerVehiclePayload => ({
  vehicleModel: '',
  licensePlate: '',
  seats: 4,
  odometer: 0,
  hourlyPrice: 0,
  dailyPrice: 0,
  monthlyPrice: 0,
  description: '',
  vehicleType: meta?.vehicleTypes?.[0] ?? 'ElectricCar',
  requiresLicense: true,
  batteryCapacity: 0,
  mainImageUrl: '',
  imageUrls: [],
  features: [],
  categoryId: meta?.categories?.[0]?.id,
  transmissionTypeId: meta?.transmissions?.[0]?.id,
});

export const AddVehicleModal = ({ meta, onCreated }: AddVehicleModalProps) => {
  const { success, error } = useNotification();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [form, setForm] = useState<OwnerVehiclePayload>(() => createInitialForm(meta));

  const canSubmit = useMemo(() => Boolean(meta), [meta]);

  const resetForm = () => {
    setForm(createInitialForm(meta));
    setImageUrlsText('');
    setFeaturesText('');
  };

  const onClose = () => {
    setOpen(false);
    resetForm();
  };

  const onSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOwnerVehicle({
        ...form,
        imageUrls: toStringList(imageUrlsText),
        features: toStringList(featuresText),
      });
      success('Them xe thanh cong. Xe se cho admin duyet.');
      onCreated?.(created);
      onClose();
    } catch {
      error('Khong the them xe. Vui long kiem tra lai thong tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Add Vehicle
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Vehicle</h3>
              <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                <i className="fas fa-times" />
              </button>
            </div>

            {!canSubmit ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Dang tai metadata xe. Vui long thu lai sau.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Vehicle model"
                  value={form.vehicleModel}
                  onChange={(event) => setForm((prev) => ({ ...prev, vehicleModel: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="License plate"
                  value={form.licensePlate}
                  onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Year manufactured"
                  type="number"
                  value={form.yearManufactured ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, yearManufactured: Number(event.target.value) || undefined }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Seats"
                  type="number"
                  value={form.seats}
                  onChange={(event) => setForm((prev) => ({ ...prev, seats: Number(event.target.value) || 0 }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Daily price"
                  type="number"
                  value={form.dailyPrice}
                  onChange={(event) => setForm((prev) => ({ ...prev, dailyPrice: Number(event.target.value) || 0 }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Hourly price"
                  type="number"
                  value={form.hourlyPrice ?? 0}
                  onChange={(event) => setForm((prev) => ({ ...prev, hourlyPrice: Number(event.target.value) || 0 }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Monthly price"
                  type="number"
                  value={form.monthlyPrice ?? 0}
                  onChange={(event) => setForm((prev) => ({ ...prev, monthlyPrice: Number(event.target.value) || 0 }))}
                />
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={form.vehicleType}
                  onChange={(event) => setForm((prev) => ({ ...prev, vehicleType: event.target.value }))}
                >
                  {(meta?.vehicleTypes ?? []).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={form.categoryId ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">Category</option>
                  {(meta?.categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={form.transmissionTypeId ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      transmissionTypeId: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">Transmission</option>
                  {(meta?.transmissions ?? []).map((transmission) => (
                    <option key={transmission.id} value={transmission.id}>
                      {transmission.name}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
                  placeholder="Main image URL"
                  value={form.mainImageUrl ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, mainImageUrl: event.target.value }))}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
                  placeholder="Image URLs (comma separated)"
                  value={imageUrlsText}
                  onChange={(event) => setImageUrlsText(event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
                  placeholder="Features (comma separated)"
                  value={featuresText}
                  onChange={(event) => setFeaturesText(event.target.value)}
                />
                <textarea
                  className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
                  rows={3}
                  placeholder="Description"
                  value={form.description ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => void onSubmit()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
