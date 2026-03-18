interface BookingStatCardProps {
  label: string;
  value: number;
  tone?: 'emerald' | 'amber' | 'slate';
}

const toneMap = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const BookingStatCard = ({ label, value, tone = 'slate' }: BookingStatCardProps) => {
  return (
    <article className={`rounded-xl border p-4 ${toneMap[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
};
