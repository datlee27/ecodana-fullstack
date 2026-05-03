import { useEffect, useState } from 'react';
import { getMyProfile } from '../../api/authApi';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, PageContainer, PageHeader, Skeleton } from '../../design-system';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfile } from '../../types/user';

const displayValue = (value?: string | null) => value?.trim() || 'Chua cap nhat';

const ProfilePage = () => {
  const { user, setCurrentUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextProfile = await getMyProfile();
      setProfile(nextProfile);
      setCurrentUser(nextProfile);
    } catch {
      setError('Khong the tai thong tin tai khoan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <Skeleton className="h-20 w-full max-w-3xl" />
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState title="Khong tai duoc profile" description={error} tone="danger" action={<Button onClick={loadProfile}>Thu lai</Button>} />
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <EmptyState title="Chua co thong tin profile" description="Vui long dang nhap lai de xem tai khoan." />
      </PageContainer>
    );
  }

  const fullName = `${displayValue(profile.lastName)} ${displayValue(profile.firstName)}`.trim();

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Ho so cua toi"
        description="Thong tin dang nhap va vai tro hien tai cua tai khoan."
        actions={
          <Button variant="outline" onClick={() => void logout()}>
            Dang xuat
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-2xl font-bold text-green-800">
              {displayValue(profile.firstName).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-strong">{fullName}</h2>
              <p className="text-sm text-text-muted">{displayValue(profile.email)}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge tone="primary" size="md">{displayValue(profile.role)}</Badge>
              <Badge tone={profile.status?.toLowerCase() === 'active' ? 'success' : 'neutral'} size="md">
                {displayValue(profile.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thong tin ca nhan</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted p-4">
                <dt className="text-sm font-medium text-text-muted">Username</dt>
                <dd className="mt-1 font-semibold text-text-strong">{displayValue(profile.username)}</dd>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <dt className="text-sm font-medium text-text-muted">Email</dt>
                <dd className="mt-1 font-semibold text-text-strong">{displayValue(profile.email)}</dd>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <dt className="text-sm font-medium text-text-muted">So dien thoai</dt>
                <dd className="mt-1 font-semibold text-text-strong">{displayValue(profile.phoneNumber)}</dd>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <dt className="text-sm font-medium text-text-muted">Ma tai khoan</dt>
                <dd className="mt-1 break-all font-semibold text-text-strong">{displayValue(profile.id)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
