import { useEffect, useState } from 'react';
import { getOwnerFeedback } from '../../../api/ownerApi';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { Badge, EmptyState, PageHeader } from '../../../design-system';
import type { OwnerFeedbackItem } from '../../../types/owner';

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('vi-VN') : 'Chua cap nhat');

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
    <section className="space-y-6">
      <PageHeader
        eyebrow="Owner portal"
        title="Danh gia tu khach hang"
        description="Theo doi rating, nhan xet va cac phan hoi lien quan den xe cua ban."
      />

      {feedback.length === 0 ? (
        <EmptyState title="Chua co feedback nao" description="Danh gia cua khach hang se xuat hien tai day sau khi hoan tat chuyen di." />
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <article key={item.feedbackId} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-text-strong">{item.vehicleModel || 'Chua cap nhat'}</p>
                  <p className="text-xs text-text-muted">
                    {item.userFullName || 'Khach hang'} · {item.bookingCode || 'Chua cap nhat'} · {formatDate(item.createdDate)}
                  </p>
                </div>
                <Badge tone={item.rating >= 4 ? 'success' : item.rating >= 3 ? 'warning' : 'danger'} size="md">
                  {item.rating}/5
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-base">{item.content || 'Khong co noi dung.'}</p>
              {item.staffReply ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <p className="font-semibold">Phan hoi da gui</p>
                  <p>{item.staffReply}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-muted px-3 py-2 text-sm text-text-muted">
                  Chua co phan hoi bo sung cho danh gia nay.
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OwnerFeedbackPage;
