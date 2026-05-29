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

export const ProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    category: z.string().min(1),
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

