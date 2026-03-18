export const LoadingState = ({ message = 'Đang tải dữ liệu...' }: { message?: string }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
      <p>{message}</p>
    </div>
  );
};
