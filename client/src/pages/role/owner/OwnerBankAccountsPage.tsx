import { useEffect, useState } from 'react';
import { getOwnerBankAccounts } from '../../../api/ownerApi';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { Badge, EmptyState, PageHeader } from '../../../design-system';
import type { OwnerBankAccountItem } from '../../../types/owner';

const OwnerBankAccountsPage = () => {
  const [accounts, setAccounts] = useState<OwnerBankAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnerBankAccounts();
      setAccounts(data);
    } catch {
      setError('Khong the tai danh sach tai khoan ngan hang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  if (loading) {
    return <LoadingState message="Dang tai bank accounts..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadAccounts()} />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Owner portal"
        title="Tai khoan ngan hang"
        description="Danh sach tai khoan dung de nhan doanh thu va doi soat thanh toan."
      />

      {accounts.length === 0 ? (
        <EmptyState title="Chua co tai khoan ngan hang" description="Khi owner them tai khoan nhan tien, thong tin se hien thi tai day." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <article key={account.bankAccountId} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-strong">{account.bankName}</p>
                  <p className="text-sm text-text-muted">{account.accountHolderName}</p>
                </div>
                {account.isDefault ? (
                  <Badge tone="success" size="md">Mac dinh</Badge>
                ) : null}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-text-base">So tai khoan: {account.accountNumber}</p>
                <p className="text-text-muted">Ma ngan hang: {account.bankCode || 'Chua cap nhat'}</p>
              </div>
              {account.qrCodeImagePath ? (
                <a
                  href={account.qrCodeImagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Xem QR nhan tien
                </a>
              ) : (
                <p className="mt-4 text-sm text-text-muted">Chua co QR nhan tien.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OwnerBankAccountsPage;
