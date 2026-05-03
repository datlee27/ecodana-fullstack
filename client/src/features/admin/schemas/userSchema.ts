/**
 * Admin User Form — Zod schema mirroring Spring Boot @Valid constraints.
 *
 * Rules mirror UserRequest.java:
 *  - username: 3–50 chars, trimmed
 *  - email: valid format, 255 max
 *  - password: 8 min (optional on edit)
 *  - firstName/lastName: 100 max, trimmed
 *  - phoneNumber: optional, trimmed
 *  - roleId, status: required enum-constrained strings
 */
import { z } from 'zod';

const trimStr = (v: unknown) => (typeof v === 'string' ? v.trim() : v);

export const userFormSchema = z
  .object({
    username: z.preprocess(trimStr, z.string().min(3, 'Tối thiểu 3 ký tự').max(50, 'Tối đa 50 ký tự')),
    email: z.preprocess(trimStr, z.string().email('Email không hợp lệ').max(255)),
    password: z.preprocess(trimStr, z.string().min(8, 'Tối thiểu 8 ký tự').max(128).or(z.literal(''))),
    firstName: z.preprocess(trimStr, z.string().max(100).or(z.literal(''))),
    lastName: z.preprocess(trimStr, z.string().max(100).or(z.literal(''))),
    phoneNumber: z.preprocess(trimStr, z.string().max(20).or(z.literal(''))),
    avatarUrl: z.preprocess(trimStr, z.string().max(500).or(z.literal(''))),
    roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
    status: z.enum(['Active', 'Inactive', 'Banned']),
    gender: z.enum(['Male', 'Female', 'Other']).or(z.literal('')).optional(),
    emailVerified: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    lockoutEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // password required on create; optional on edit (handled externally via `isEditing`)
    // nothing else needed here — per-field rules cover everything
    void data;
    void ctx;
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

// Transform form values → backend UserRequest DTO shape
export function toUserRequest(values: UserFormValues, isEditing: boolean) {
  return {
    username: values.username,
    email: values.email,
    password: values.password || undefined,
    firstName: values.firstName || null,
    lastName: values.lastName || null,
    phoneNumber: values.phoneNumber || null,
    avatarUrl: values.avatarUrl || null,
    roleId: values.roleId,
    status: values.status,
    gender: values.gender || null,
    emailVerified: values.emailVerified ?? false,
    twoFactorEnabled: values.twoFactorEnabled ?? false,
    lockoutEnabled: values.lockoutEnabled ?? false,
    // password is required on create, optional on edit
    ...(isEditing && !values.password ? { password: undefined } : {}),
  };
}
