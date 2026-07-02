import { z } from 'zod';

export const CreateCouponSchema = z.object({
    code: z.string().min(3, 'Code must be at least 3 characters').max(20).transform(s => s.toUpperCase()),
    description: z.string().optional(),
    discountPercent: z.number().min(1).max(100),
    productId: z.string().optional(),
    minPurchase: z.number().min(0).optional().default(0),
    maxUses: z.number().int().min(0).optional().default(0),
    maxUsesPerUser: z.number().int().min(0).optional().default(0),
    expiresAt: z.string().datetime().optional(),
});

export const UpdateCouponSchema = z.object({
    code: z.string().min(3).max(20).transform(s => s.toUpperCase()).optional(),
    description: z.string().optional(),
    discountPercent: z.number().min(1).max(100).optional(),
    productId: z.string().nullable().optional(),
    minPurchase: z.number().min(0).optional(),
    maxUses: z.number().int().min(0).optional(),
    maxUsesPerUser: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
});

export const ApplyCouponSchema = z.object({
    code: z.string().min(1).transform(s => s.toUpperCase()),
    orderId: z.string().min(1),
});

export const CouponIdParam = z.object({
    id: z.string(),
});
