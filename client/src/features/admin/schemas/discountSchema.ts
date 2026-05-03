/**
 * Discount form Zod schema — mirrors DiscountApiController field requirements.
 *
 * Required: discountName, discountType, discountValue, startDate, endDate
 * Optional: description, voucherCode, minOrderAmount, maxDiscountAmount,
 *           usageLimit, discountCategory, isActive
 */
import { z } from 'zod';

const trimStr = (v: unknown) => (typeof v === 'string' ? v.trim() : v);

export const discountFormSchema = z
  .object({
    discountName: z.preprocess(trimStr, z.string().min(1, 'Bắt buộc').max(100)),
    description: z.preprocess(trimStr, z.string().max(500).or(z.literal(''))).optional(),
    discountType: z.enum(['Percentage', 'FixedAmount']),
    discountValue: z.coerce.number().positive('Phải > 0'),
    startDate: z.string().min(1, 'Bắt buộc'),
    endDate: z.string().min(1, 'Bắt buộc'),
    isActive: z.boolean(),
    voucherCode: z.preprocess(trimStr, z.string().max(50).or(z.literal(''))).optional(),
    minOrderAmount: z.coerce.number().min(0).optional(),
    maxDiscountAmount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(0).optional(),
    discountCategory: z.preprocess(trimStr, z.string().max(50).or(z.literal(''))).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }
    if (data.discountType === 'Percentage' && data.discountValue > 100) {
      ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'Phần trăm giảm tối đa 100%' });
    }
  });

export type DiscountFormValues = z.infer<typeof discountFormSchema>;

/** Maps form values to the backend payload shape expected by DiscountApiController */
export function toDiscountRequest(values: DiscountFormValues): Record<string, unknown> {
  return {
    discountName: values.discountName,
    description: values.description || null,
    discountType: values.discountType,
    discountValue: values.discountValue,
    startDate: values.startDate,
    endDate: values.endDate,
    isActive: values.isActive,
    voucherCode: values.voucherCode || null,
    minOrderAmount: values.minOrderAmount ?? 0,
    maxDiscountAmount: values.maxDiscountAmount ?? null,
    usageLimit: values.usageLimit ?? null,
    discountCategory: values.discountCategory || null,
  };
}
