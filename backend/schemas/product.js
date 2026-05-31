import { z } from 'zod';

const getSupabaseHost = () => {
    try {
        const url = process.env.SUPABASE_URL || 'https://rvamybeqoyznlgzglqqx.supabase.co';
        return new URL(url).hostname;
    } catch (e) {
        return 'rvamybeqoyznlgzglqqx.supabase.co';
    }
};

const supabaseHost = getSupabaseHost();

export const CATEGORIES = ['Timepieces', 'Accessories', 'Collectibles', 'Antiques', 'Toys & Pop Culture', 'Jewelry'];

export const ProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    category: z.enum(CATEGORIES),
    description: z.string().min(1),
    condition: z.string().min(1),
    price: z.number().positive(),
    image: z.string().url().refine((val) => val.includes(`${supabaseHost}/storage/v1/object/public/`), {
        message: "Image must be hosted on the project's Supabase Storage",
    }),
    images: z.array(z.string().url().refine((val) => val.includes(`${supabaseHost}/storage/v1/object/public/`), {
        message: "Images must be hosted on the project's Supabase Storage",
    })).optional(),
    keywords: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
    authenticityStatus: z.string().optional(),
    sellerId: z.string(),
});

export const ProductIdParam = z.object({
    id: z.string(),
});

export const AdminProductUpdateSchema = z.object({
    brand: z.string().optional(),
    listingCategory: z.string().optional(),
    category: z.enum(CATEGORIES).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    condition: z.string().min(1).optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
});

