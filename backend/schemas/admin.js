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

/**
 * Params/query for `GET /api/admin/kyc/:userId/signed-url`.
 *
 * `path` is an object key inside the PRIVATE `kyc-documents` bucket. This schema
 * only enforces SHAPE: a relative, control-character-free key inside the `kyc/`
 * namespace, never a URL (the caller normalises a stored URL to its object path
 * first). AUTHORISATION lives in routes/adminKyc.js, which requires the path to
 * be one of the references actually stored on that user's record.
 */
export const KYCSignedUrlParams = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export const KYCSignedUrlQuery = z.object({
  path: z
    .string()
    .min(1, 'path is required')
    .max(1024, 'path is too long')
    .refine((p) => !/^[a-z][a-z0-9+.-]*:\/\//i.test(p), 'path must not be a URL')
    .refine((p) => !p.startsWith('/'), 'path must be relative')
    .refine((p) => !p.split('/').includes('..'), 'path must not traverse')
    .refine(
      (p) => ![...p].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127),
      'path contains a control character',
    )
    // Everything the app stores lives under the bucket's `kyc/` namespace.
    // Legacy objects are `kyc/<docType>-<ts>-<rand>.<ext>`, current ones are
    // `kyc/<uid>/<uuid>.<ext>`. A deliberately loose character rule: the real
    // authorisation is the stored-value allowlist in routes/adminKyc.js, so a
    // strict charset here would only produce false 400s on odd legacy filenames.
    .refine((p) => p.startsWith('kyc/'), 'path must be inside the kyc/ namespace'),
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
  // Accepts both ISO strings and the `datetime-local` format the admin UI emits
  // (e.g. "2026-07-16T10:30"), which z.string().datetime() would reject.
  soldAt: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid sale date')
    .optional(),
});
