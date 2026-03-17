import { useState } from 'react';

export const AddVehicleModal = () => {
  const [open, setOpen] = useState(false);

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
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Add Vehicle</h3>
            <p className="mt-2 text-sm text-slate-600">
              Đây là modal mẫu để tách UI. Bạn có thể nối form `react-hook-form` + API create vehicle ở bước tiếp theo.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
