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

export const ManualOrderSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerPhone: z.string().min(1, 'Buyer phone is required'),
  buyerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer']).default('cash'),
  notes: z.string().optional(),
  soldAt: z.string().optional(),
});
