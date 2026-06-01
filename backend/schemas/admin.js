import { z } from 'zod';

export const KYCRequestIdParam = z.object({
    id: z.string(),
});

export const KYCApprovalSchema = z.object({
    notes: z.string().optional(),
});

export const KYCRejectionSchema = z.object({
    reason: z.string().min(1, 'Rejection reason is required'),
});

export const CreatePayoutSchema = z.object({
    vendorId: z.string().min(1),
    amount: z.number().positive(),
    periodStart: z.string().min(1),
    periodEnd: z.string().min(1),
    note: z.string().optional(),
});

export const UpdatePayoutStatusSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED']),
});
