import type { Vehicle } from '../../types/vehicle';

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Model</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Seats</th>
            <th className="px-4 py-3 font-semibold">Price/Day</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.vehicleId}>
              <td className="px-4 py-3 text-slate-800">{vehicle.vehicleModel}</td>
              <td className="px-4 py-3 text-slate-600">{vehicle.vehicleType}</td>
              <td className="px-4 py-3 text-slate-600">{vehicle.seats}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice)} đ
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {vehicle.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
