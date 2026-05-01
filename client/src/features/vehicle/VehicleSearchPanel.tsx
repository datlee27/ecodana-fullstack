import { BatteryCharging, CalendarDays, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Button, Card, Input, Select, cn } from '../../design-system';
import type { VehicleSearchValues } from './vehicleSearchValues';

interface VehicleSearchPanelProps {
  values: VehicleSearchValues;
  variant?: 'hero' | 'filter';
  showAdvanced?: boolean;
  className?: string;
  onChange: (nextValues: VehicleSearchValues) => void;
  onSubmit: () => void;
  onClear?: () => void;
}

const vehicleTypeOptions = [
  { value: '', label: 'Tất cả loại xe' },
  { value: 'ElectricCar', label: 'Ô tô điện' },
  { value: 'ElectricMotorcycle', label: 'Xe máy điện' },
];

const categoryOptions = [
  { value: '', label: 'Tất cả nhu cầu' },
  { value: 'Cong viec, di lai', label: 'Công việc, đi lại' },
  { value: 'Gia dinh', label: 'Gia đình' },
  { value: 'Tiep khach, du tiec', label: 'Tiếp khách, dự tiệc' },
];

const budgetOptions = [
  { value: '', label: 'Tất cả ngân sách' },
  { value: 'under500k', label: 'Dưới 500 nghìn' },
  { value: 'over500k', label: 'Trên 500 nghìn' },
];

const seatOptions = [
  { value: '', label: 'Tất cả số chỗ' },
  { value: '2', label: '2 chỗ' },
  { value: '4', label: '4 chỗ' },
  { value: '5', label: '5 chỗ' },
  { value: '7', label: '7 chỗ' },
];

const licenseOptions = [
  { value: '', label: 'Tất cả yêu cầu' },
  { value: 'true', label: 'Cần bằng lái' },
  { value: 'false', label: 'Không cần bằng lái' },
];

export const VehicleSearchPanel = ({
  values,
  variant = 'filter',
  showAdvanced = true,
  className,
  onChange,
  onSubmit,
  onClear,
}: VehicleSearchPanelProps) => {
  const updateValue = (key: keyof VehicleSearchValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <Card
      className={cn(
        'border-border bg-surface p-4 shadow-sm sm:p-5',
        variant === 'hero' && 'shadow-card',
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Input
          label="Địa điểm"
          value={values.location}
          onChange={(event) => updateValue('location', event.target.value)}
          placeholder="Nhập khu vực nhận xe"
          leftIcon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          wrapperClassName="lg:col-span-4"
        />
        <Input
          label="Ngày nhận"
          type="date"
          value={values.pickupDate}
          onChange={(event) => updateValue('pickupDate', event.target.value)}
          leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          wrapperClassName="lg:col-span-2"
        />
        <Input
          label="Ngày trả"
          type="date"
          value={values.returnDate}
          onChange={(event) => updateValue('returnDate', event.target.value)}
          leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          wrapperClassName="lg:col-span-2"
        />
        <Select
          label="Loại xe"
          value={values.vehicleType}
          onChange={(event) => updateValue('vehicleType', event.target.value)}
          leftIcon={<BatteryCharging className="h-4 w-4" aria-hidden="true" />}
          wrapperClassName="lg:col-span-2"
        >
          {vehicleTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="flex items-end gap-2 lg:col-span-2">
          {onClear ? (
            <Button type="button" variant="outline" className="shrink-0" onClick={onClear}>
              Xóa
            </Button>
          ) : null}
          <Button type="button" className="flex-1" onClick={onSubmit} leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}>
            Tìm xe
          </Button>
        </div>
      </div>

      {showAdvanced ? (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Giờ nhận"
            type="time"
            value={values.pickupTime}
            onChange={(event) => updateValue('pickupTime', event.target.value)}
          />
          <Input
            label="Giờ trả"
            type="time"
            value={values.returnTime}
            onChange={(event) => updateValue('returnTime', event.target.value)}
          />
          <Select
            label="Nhu cầu"
            value={values.category}
            onChange={(event) => updateValue('category', event.target.value)}
            leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select label="Ngân sách" value={values.budget} onChange={(event) => updateValue('budget', event.target.value)}>
            {budgetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1 xl:grid-cols-2">
            <Select
              label="Số chỗ"
              value={values.seats}
              onChange={(event) => updateValue('seats', event.target.value)}
              leftIcon={<Users className="h-4 w-4" aria-hidden="true" />}
            >
              {seatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Bằng lái"
              value={values.requiresLicense}
              onChange={(event) => updateValue('requiresLicense', event.target.value)}
            >
              {licenseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
