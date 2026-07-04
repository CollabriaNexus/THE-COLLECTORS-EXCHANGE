import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  productId: z.string().min(1),
  // Every listing is a unique one-of-a-kind item; quantity can only ever be 1.
  quantity: z.literal(1).optional().default(1),
});

export const CreateOrderSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  items: z.array(CreateOrderItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['online', 'cod']).default('online'),
  couponCode: z.string().optional(),
});

export const ValidateCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((s) => s.toUpperCase()),
  items: z
    .array(
      z.object({
        productId: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive().optional().default(1),
      }),
    )
    .min(1),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});
