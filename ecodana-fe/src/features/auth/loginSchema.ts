import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Vui lòng nhập email hoặc username'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginForm = z.infer<typeof loginSchema>;
