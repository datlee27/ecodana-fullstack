import { useEffect, useState } from 'react';
import { getOwnerFeedback } from '../../../api/ownerApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import type { OwnerFeedbackItem } from '../../../types/owner';

const OwnerFeedbackPage = () => {
  const [feedback, setFeedback] = useState<OwnerFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnerFeedback();
      setFeedback(data);
    } catch {
      setError('Khong the tai danh sach feedback owner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, []);

  if (loading) {
    return <LoadingState message="Dang tai feedback owner..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadFeedback()} />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feedback Management</h1>
        <p className="text-sm text-slate-600">Xem danh gia cua khach hang cho xe cua ban.</p>
      </div>

      {feedback.length === 0 ? (
        <EmptyState message="Chua co feedback nao." />
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <article key={item.feedbackId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.vehicleModel || 'Vehicle'}</p>
                  <p className="text-xs text-slate-500">
                    {item.userFullName || 'Customer'} - {item.bookingCode || 'N/A'}
                  </p>
                </div>
                <div className="text-sm font-semibold text-amber-600">
                  <i className="fas fa-star mr-1" />
                  {item.rating}/5
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700">{item.content || 'Khong co noi dung.'}</p>
              {item.staffReply ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <p className="font-semibold">Owner reply</p>
                  <p>{item.staffReply}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OwnerFeedbackPage;
