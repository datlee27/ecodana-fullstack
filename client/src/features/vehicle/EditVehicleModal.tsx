import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getOwnerApiErrorMessage, updateOwnerVehicle, uploadOwnerVehicleAuxiliaryImages, uploadOwnerVehicleMainImage } from '../../api/ownerApi';
import { useNotification } from '../../hooks/useNotification';
import type { OwnerVehicle, OwnerVehicleMeta, OwnerVehiclePayload } from '../../types/owner';

interface EditVehicleModalProps {
  vehicle: OwnerVehicle;
  meta?: OwnerVehicleMeta | null;
  onSaved?: (vehicle: OwnerVehicle) => void;
}

const vehicleFeatures: Record<string, string[]> = {
  ElectricCar: [
    'GPS Navigation',
    'Bluetooth Audio',
    'Air Conditioning',
    'Power Windows',
    'Central Locking',
    'USB Charging Ports',
    'Backup Camera',
    'Parking Sensors',
    'Cruise Control',
    'Keyless Entry',
    'Sunroof',
    'Leather Seats',
    'Heated Seats',
    'Automatic Transmission',
    'ABS Brakes',
    'Airbags',
    'LED Headlights',
    'Fog Lights',
    'Rain Sensing Wipers',
    'Auto Climate Control',
  ],
  ElectricMotorcycle: [
    'GPS Navigation',
    'Bluetooth Audio',
    'USB Charging Port',
    'LED Headlights',
    'Digital Display',
    'Anti-lock Braking System',
    'Keyless Start',
    'Storage Compartment',
    'Phone Mount',
    'Helmet Lock',
    'Side Stand',
    'Center Stand',
    'Windshield',
    'Rear View Mirrors',
    'Turn Signals',
    'Horn',
    'Speedometer',
    'Battery Indicator',
    'Range Indicator',
    'Eco Mode',
  ],
};

const vehicleTypeLabels: Record<string, string> = {
  ElectricCar: 'Xe O To Dien',
  ElectricMotorcycle: 'Xe May Dien',
};

const fallbackStatuses = ['Available', 'Rented', 'Unavailable', 'Maintenance', 'PendingApproval'];

const mapVehicleToPayload = (vehicle: OwnerVehicle): OwnerVehiclePayload => ({
  vehicleModel: vehicle.vehicleModel,
  yearManufactured: vehicle.yearManufactured,
  licensePlate: vehicle.licensePlate ?? '',
  seats: vehicle.seats,
  odometer: vehicle.odometer ?? 0,
  hourlyPrice: vehicle.hourlyPrice,
  dailyPrice: vehicle.dailyPrice,
  monthlyPrice: vehicle.monthlyPrice,
  description: vehicle.description ?? '',
  vehicleType: vehicle.vehicleType,
  requiresLicense: vehicle.requiresLicense,
  batteryCapacity: vehicle.batteryCapacity,
  mainImageUrl: vehicle.mainImageUrl,
  imageUrls: vehicle.imageUrls ?? [],
  features: vehicle.features ?? [],
  categoryId: vehicle.categoryId,
  transmissionTypeId: vehicle.transmissionTypeId,
  status: vehicle.status,
});

const mergeImageUrls = (current: string[], incoming: string[]): string[] => {
  const merged = [...current];
  incoming.forEach((url) => {
    if (url && !merged.includes(url)) {
      merged.push(url);
    }
  });
  return merged.slice(0, 10);
};

export const EditVehicleModal = ({ vehicle, meta, onSaved }: EditVehicleModalProps) => {
  const { success, error } = useNotification();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAux, setUploadingAux] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<OwnerVehiclePayload>(() => mapVehicleToPayload(vehicle));
  const [auxiliaryImageUrls, setAuxiliaryImageUrls] = useState<string[]>(vehicle.imageUrls ?? []);

  const availableFeatures = useMemo(() => vehicleFeatures[form.vehicleType] ?? [], [form.vehicleType]);
  const isUploadingAny = uploadingMain || uploadingAux;
  const vehicleStatuses = useMemo(() => {
    const metaStatuses = meta?.vehicleStatuses ?? [];
    if (metaStatuses.length > 0) {
      return metaStatuses;
    }
    return fallbackStatuses;
  }, [meta?.vehicleStatuses]);

  useEffect(() => {
    setForm(mapVehicleToPayload(vehicle));
    setAuxiliaryImageUrls(vehicle.imageUrls ?? []);
    setSubmitError(null);
  }, [vehicle]);

  const resetByVehicle = () => {
    setForm(mapVehicleToPayload(vehicle));
    setAuxiliaryImageUrls(vehicle.imageUrls ?? []);
    setSubmitError(null);
  };

  const onClose = () => {
    setOpen(false);
    resetByVehicle();
  };

  const onSubmit = async () => {
    if (submitting || uploadingMain || uploadingAux) {
      return;
    }

    if (!form.vehicleModel.trim() || !form.licensePlate.trim()) {
      setSubmitError('Vui long nhap day du ten xe va bien so.');
      return;
    }
    if (form.dailyPrice <= 0 || form.seats <= 0) {
      setSubmitError('Gia theo ngay va so cho phai lon hon 0.');
      return;
    }
    if (!form.mainImageUrl?.trim()) {
      setSubmitError('Vui long upload hoac chup anh chinh.');
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const updated = await updateOwnerVehicle(vehicle.vehicleId, {
        ...form,
        imageUrls: auxiliaryImageUrls,
        features: form.features ?? [],
      });
      success('Cap nhat xe thanh cong.');
      onSaved?.(updated);
      onClose();
    } catch (apiError) {
      error(getOwnerApiErrorMessage(apiError, 'Khong the cap nhat xe. Vui long thu lai.'));
    } finally {
      setSubmitting(false);
    }
  };

  const onMainImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isUploadingAny) {
      return;
    }
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setSubmitError(null);
    setUploadingMain(true);
    try {
      const url = await uploadOwnerVehicleMainImage(file);
      setForm((prev) => ({ ...prev, mainImageUrl: url }));
      success('Upload anh chinh thanh cong.');
    } catch {
      error('Khong the upload anh chinh. Vui long thu lai.');
    } finally {
      setUploadingMain(false);
    }
  };

  const onAuxiliaryImagesSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isUploadingAny) {
      return;
    }
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (files.length === 0) {
      return;
    }

    const remainingSlots = Math.max(10 - auxiliaryImageUrls.length, 0);
    if (remainingSlots <= 0) {
      setSubmitError('Da du 10 anh phu. Hay xoa bot truoc khi them.');
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      error(`Chi con them duoc ${remainingSlots} anh phu.`);
    }

    setSubmitError(null);
    setUploadingAux(true);
    try {
      const uploadedUrls = await uploadOwnerVehicleAuxiliaryImages(selectedFiles);
      setAuxiliaryImageUrls((prev) => mergeImageUrls(prev, uploadedUrls));
      success(`Upload ${uploadedUrls.length} anh phu thanh cong.`);
    } catch {
      error('Khong the upload anh phu. Vui long thu lai.');
    } finally {
      setUploadingAux(false);
    }
  };

  const removeAuxImage = (index: number) => {
    setAuxiliaryImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-slate-900">Edit Vehicle</h3>
              <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="max-h-[80vh] space-y-6 overflow-y-auto p-6">
              {submitError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</p> : null}

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-3">
                  <h4 className="text-base font-semibold text-slate-800">
                    <i className="fas fa-car-side mr-2 text-emerald-600" />
                    Thong tin co ban
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Hang va Ten xe *</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.vehicleModel}
                      onChange={(event) => setForm((prev) => ({ ...prev, vehicleModel: event.target.value }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Bien so xe *</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.licensePlate}
                      onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Loai xe *</span>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.vehicleType}
                      onChange={(event) => {
                        const nextType = event.target.value;
                        const allowedFeatures = vehicleFeatures[nextType] ?? [];
                        setForm((prev) => ({
                          ...prev,
                          vehicleType: nextType,
                          features: (prev.features ?? []).filter((item) => allowedFeatures.includes(item)),
                        }));
                      }}
                    >
                      {(meta?.vehicleTypes ?? ['ElectricCar', 'ElectricMotorcycle']).map((type) => (
                        <option key={type} value={type}>
                          {vehicleTypeLabels[type] ?? type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Nam san xuat</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={2000}
                      value={form.yearManufactured ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          yearManufactured: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">So cho *</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={1}
                      value={form.seats}
                      onChange={(event) => setForm((prev) => ({ ...prev, seats: Number(event.target.value) || 0 }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">So km da di (Odometer) *</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={0}
                      value={form.odometer ?? 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, odometer: Number(event.target.value) || 0 }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Truyen dong</span>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.transmissionTypeId ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          transmissionTypeId: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    >
                      <option value="">Chon loai truyen dong</option>
                      {(meta?.transmissions ?? []).map((transmission) => (
                        <option key={transmission.id} value={transmission.id}>
                          {transmission.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Phan loai xe</span>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.categoryId ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          categoryId: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    >
                      <option value="">Chon phan loai</option>
                      {(meta?.categories ?? []).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Dung luong pin (kWh)</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.batteryCapacity ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          batteryCapacity: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Trang thai</span>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.status ?? ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      {vehicleStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-3">
                  <h4 className="text-base font-semibold text-slate-800">
                    <i className="fas fa-dollar-sign mr-2 text-emerald-600" />
                    Gia thue
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Gia theo gio (VND)</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={0}
                      step={1000}
                      value={form.hourlyPrice ?? 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, hourlyPrice: Number(event.target.value) || 0 }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Gia theo ngay (VND) *</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={0}
                      step={1000}
                      value={form.dailyPrice}
                      onChange={(event) => setForm((prev) => ({ ...prev, dailyPrice: Number(event.target.value) || 0 }))}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Gia theo thang (VND)</span>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      type="number"
                      min={0}
                      step={1000}
                      value={form.monthlyPrice ?? 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, monthlyPrice: Number(event.target.value) || 0 }))}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-3">
                  <h4 className="text-base font-semibold text-slate-800">
                    <i className="fas fa-list-alt mr-2 text-emerald-600" />
                    Mo ta va Tinh nang
                  </h4>
                </div>
                <div className="space-y-4 p-5">
                  <label className="block text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Mo ta</span>
                    <textarea
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      rows={3}
                      value={form.description ?? ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </label>
                  <div>
                    <p className="mb-2 block text-sm font-medium text-slate-700">Tinh nang</p>
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 md:grid-cols-2">
                      {availableFeatures.map((feature) => {
                        const checked = (form.features ?? []).includes(feature);
                        return (
                          <label key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setForm((prev) => {
                                  const current = prev.features ?? [];
                                  const next = checked ? current.filter((item) => item !== feature) : [...current, feature];
                                  return { ...prev, features: next };
                                })
                              }
                            />
                            <span>{feature}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <label className="block max-w-xs text-sm text-slate-700">
                    <span className="mb-1 block font-medium">Yeu cau bang lai</span>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={form.requiresLicense ? 'true' : 'false'}
                      onChange={(event) => setForm((prev) => ({ ...prev, requiresLicense: event.target.value === 'true' }))}
                    >
                      <option value="true">Co</option>
                      <option value="false">Khong</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-3">
                  <h4 className="text-base font-semibold text-slate-800">
                    <i className="fas fa-images mr-2 text-emerald-600" />
                    Hinh anh
                  </h4>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm font-medium text-slate-700">Anh chinh hien tai</p>
                  {form.mainImageUrl ? (
                    <img src={form.mainImageUrl} alt="Main preview" className="max-h-44 rounded border border-slate-200 p-1" />
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">Chua co anh chinh.</div>
                  )}
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <label
                      className={`inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 ${
                        isUploadingAny ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
                      }`}
                    >
                      <i className="fas fa-image mr-2" />
                      {uploadingMain ? 'Dang upload...' : 'Thay anh chinh tu thu vien'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingAny}
                        className="hidden"
                        onChange={(event) => void onMainImageSelect(event)}
                      />
                    </label>
                    <label
                      className={`inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 ${
                        isUploadingAny ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
                      }`}
                    >
                      <i className="fas fa-camera mr-2" />
                      {uploadingMain ? 'Dang upload...' : 'Thay anh chinh bang camera'}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        disabled={isUploadingAny}
                        className="hidden"
                        onChange={(event) => void onMainImageSelect(event)}
                      />
                    </label>
                  </div>

                  <p className="text-sm font-medium text-slate-700">Anh phu ({auxiliaryImageUrls.length}/10)</p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <label
                      className={`inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 ${
                        isUploadingAny ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
                      }`}
                    >
                      <i className="fas fa-images mr-2" />
                      {uploadingAux ? 'Dang upload...' : 'Them anh phu tu thu vien'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingAny}
                        className="hidden"
                        onChange={(event) => void onAuxiliaryImagesSelect(event)}
                      />
                    </label>
                    <label
                      className={`inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 ${
                        isUploadingAny ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
                      }`}
                    >
                      <i className="fas fa-camera mr-2" />
                      {uploadingAux ? 'Dang upload...' : 'Them anh phu bang camera'}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        disabled={isUploadingAny}
                        className="hidden"
                        onChange={(event) => void onAuxiliaryImagesSelect(event)}
                      />
                    </label>
                  </div>
                  {auxiliaryImageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {auxiliaryImageUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative">
                          <img src={url} alt={`Aux ${index + 1}`} className="h-20 w-full rounded border border-slate-200 object-cover p-1" />
                          <button
                            type="button"
                            onClick={() => removeAuxImage(index)}
                            className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">Chua co anh phu.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || uploadingMain || uploadingAux}
                onClick={() => void onSubmit()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Saving...' : uploadingMain || uploadingAux ? 'Uploading images...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
