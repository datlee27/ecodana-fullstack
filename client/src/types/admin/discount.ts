export type DiscountType = 'Percentage' | 'FixedAmount';

export interface Discount {
  discountId: string;
  discountName: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  voucherCode?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  discountCategory?: string;
  createdDate?: string;
}

export interface DiscountFilters {
  isActive?: boolean;
  search?: string;
}

export interface DiscountStats {
  total: number;
  active: number;
  inactive: number;
}
