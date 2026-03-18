import { useEffect, useState } from 'react';
import { getOwnerBankAccounts } from '../../../api/ownerApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
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
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
        <p className="text-sm text-slate-600">Danh sach tai khoan ngan hang de nhan doanh thu.</p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState message="Chua co tai khoan ngan hang nao." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => (
            <article key={account.bankAccountId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{account.bankName}</p>
                  <p className="text-sm text-slate-600">{account.accountHolderName}</p>
                </div>
                {account.isDefault ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Default</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-700">Account: {account.accountNumber}</p>
              <p className="text-sm text-slate-500">Bank code: {account.bankCode || 'N/A'}</p>
              {account.qrCodeImagePath ? (
                <a
                  href={account.qrCodeImagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View QR
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OwnerBankAccountsPage;
