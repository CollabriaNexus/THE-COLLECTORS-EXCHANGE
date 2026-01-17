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
