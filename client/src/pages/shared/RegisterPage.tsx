import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { register as registerAccount } from '../../api/authApi';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, PageContainer } from '../../design-system';
import { useNotification } from '../../hooks/useNotification';
import type { RegisterRequest } from '../../types/auth';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Vui long nhap ten'),
    lastName: z.string().min(1, 'Vui long nhap ho'),
    email: z.string().min(1, 'Vui long nhap email').email('Email khong hop le'),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, 'Mat khau can toi thieu 8 ky tu'),
    confirmPassword: z.string().min(1, 'Vui long xac nhan mat khau'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mat khau xac nhan khong khop',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    const payload: RegisterRequest = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    try {
      await registerAccount(payload);
      success('Tai khoan da duoc tao. Vui long dang nhap de tiep tuc.');
      navigate('/login', { replace: true });
    } catch {
      notifyError('Khong the tao tai khoan. Vui long kiem tra thong tin va thu lai.');
    }
  };

  return (
    <PageContainer className="py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-start">
        <section className="space-y-5">
          <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-green-800">
            EcoDana account
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">Tao tai khoan de dat xe dien</h1>
            <p className="max-w-2xl text-base text-text-muted">
              Dang ky bang thong tin that de luu xe yeu thich, quan ly lich dat xe va tiep tuc thanh toan trong mot luong thong nhat.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {['Tim xe phu hop', 'Luu lich dat xe', 'Quan ly tai khoan'].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <p className="text-sm font-semibold text-text-strong">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Dang ky</CardTitle>
            <CardDescription>Thong tin nay duoc gui den API dang ky hien co cua EcoDana.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Ho" autoComplete="family-name" {...register('lastName')} error={errors.lastName?.message} />
                <Input label="Ten" autoComplete="given-name" {...register('firstName')} error={errors.firstName?.message} />
              </div>

              <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />

              <Input
                label="So dien thoai"
                type="tel"
                autoComplete="tel"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Mat khau"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Input
                  label="Xac nhan mat khau"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                />
                Hien mat khau
              </label>

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                Tao tai khoan
              </Button>

              <p className="text-center text-sm text-text-muted">
                Da co tai khoan?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Dang nhap
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;
