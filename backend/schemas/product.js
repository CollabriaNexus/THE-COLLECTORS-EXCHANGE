import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    category: z.string().min(1),
    description: z.string().min(1),
    condition: z.string().min(1),
    price: z.number().positive(),
    image: z.string().url(),
    images: z.array(z.string().url()).optional(),
    keywords: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
    authenticityStatus: z.string().optional(),
    sellerId: z.string(),
});

export const ProductIdParam = z.object({
    id: z.string(),
});
