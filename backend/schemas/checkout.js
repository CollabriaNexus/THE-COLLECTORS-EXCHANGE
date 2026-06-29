import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().optional().default(1),
});

export const CreateOrderSchema = z.object({
    shippingAddress: z.string().min(1, 'Shipping address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    items: z.array(CreateOrderItemSchema).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['online', 'cod']).default('online'),
});

export const VerifyPaymentSchema = z.object({
    orderId: z.string().min(1),
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    razorpaySignature: z.string().optional(),
});
