import { Check } from 'lucide-react';
import { cn } from '../../design-system';

type BookingStep = 1 | 2 | 3;

interface BookingStepIndicatorProps {
  currentStep: BookingStep;
  className?: string;
}

const steps: Array<{ step: BookingStep; label: string }> = [
  { step: 1, label: 'Chọn xe' },
  { step: 2, label: 'Xác nhận' },
  { step: 3, label: 'Hoàn tất' },
];

export const BookingStepIndicator = ({ currentStep, className }: BookingStepIndicatorProps) => {
  return (
    <nav className={cn('overflow-x-auto', className)} aria-label="Tiến trình đặt xe">
      <ol className="mx-auto flex min-w-max items-center justify-center gap-3 text-sm">
        {steps.map((item, index) => {
          const isComplete = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <li key={item.step} className="flex items-center gap-3">
              <div className={cn('flex items-center gap-2', isCurrent || isComplete ? 'text-primary' : 'text-text-muted')}>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                    isComplete && 'border-primary bg-primary text-white',
                    isCurrent && 'border-primary bg-primary-soft text-primary',
                    !isComplete && !isCurrent && 'border-border bg-muted text-text-muted',
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : item.step}
                </span>
                <span className="font-semibold">{item.label}</span>
              </div>
              {index < steps.length - 1 ? <span className="h-px w-12 bg-border" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
