import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, PageContainer, PageHeader } from '../../design-system';

const checklistItems = ['Thong tin chu xe', 'Thong tin xe dien', 'Anh va giay to xe', 'Kiem duyet va kich hoat'];

const BecomeOwnerPage = () => {
  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Owner onboarding"
        title="Dang ky xe cho thue"
        description="Trang preview cho luong chu xe. Backend contract cho submit xe chua duoc mo rong trong scope nay, nen form hien tai dung de xem UI va chuan bi thong tin."
        actions={
          <Link
            to="/owner/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted"
          >
            Xem owner portal
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Quy trinh kich hoat</CardTitle>
            <CardDescription>Cac buoc can co truoc khi xe hien thi cho khach thue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklistItems.map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-green-800">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-text-strong">{item}</p>
                  <p className="text-sm text-text-muted">Hoan tat va gui doi ngu EcoDana xem xet.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Thong tin xe</CardTitle>
                <CardDescription>Ban preview khong tao du lieu xe tren server.</CardDescription>
              </div>
              <Badge tone="info" size="md">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Hang xe" name="brand" />
                <Input label="Dong xe" name="model" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nam san xuat" name="year" type="number" min="1990" />
                <Input label="Bien so xe" name="licensePlate" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Dia diem nhan xe" name="location" />
                <Input label="Gia theo ngay" name="dailyRate" type="number" min="0" />
              </div>
              <div>
                <label htmlFor="owner-notes" className="mb-1.5 block text-sm font-medium text-text-strong">
                  Ghi chu
                </label>
                <textarea
                  id="owner-notes"
                  name="notes"
                  rows={4}
                  className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-strong shadow-sm transition-colors placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled>
                  Gui dang ky
                </Button>
                <Button type="button" variant="outline">
                  Luu ban nhap
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default BecomeOwnerPage;
