import { z } from 'zod';

export const CATEGORIES = [
  'Timepieces',
  'Accessories',
  'Collectibles',
  'Antiques',
  'Toys & Pop Culture',
  'Jewelry',
];

// Matches the ListingCategory enum in prisma/schema.prisma
export const LISTING_CATEGORIES = ['normal', 'featured', 'most_rare'];

const SpecItemSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

/**
 * Admin-only free-text values for admin-defined custom columns, keyed by
 * column id, e.g. { "col_abc123": "paid in cash" }.
 * Writable by admin/curator only — the product routes strip it from any
 * payload sent by a seller.
 */
export const AdminNotesSchema = z.record(z.string(), z.string());

export const ProductSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  category: z.enum(CATEGORIES),
  brand: z.string().nullable().optional(),
  // Curation tier — admin/curator controlled; the product routes force
  // 'normal' on seller-created listings.
  listingCategory: z.enum(LISTING_CATEGORIES).optional(),
  description: z.string().min(1),
  condition: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(1).optional().default(1),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  keywords: z.array(z.string()).optional(),
  specs: z.array(SpecItemSchema).optional().default([]),
  isVerified: z.boolean().optional(),
  authenticityStatus: z.string().optional(),
  commissionPercent: z.number().min(10).max(25).optional().default(10),
  // Accepted for admin/curator updates only — stripped for sellers in routes/products.js
  adminNotes: AdminNotesSchema.optional(),
  sellerId: z.string(),
});

export const ProductIdParam = z.object({
  id: z.string(),
});

export const AdminProductUpdateSchema = z.object({
  brand: z.string().nullable().optional(),
  listingCategory: z.enum(LISTING_CATEGORIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(1).optional(),
  condition: z.string().min(1).optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  specs: z.array(SpecItemSchema).optional(),
  commissionPercent: z.number().min(10).max(25).optional(),
  // Admin-defined custom column values (admin routes are already admin-gated)
  adminNotes: AdminNotesSchema.optional(),
  // Publish/unpublish visibility toggle (admin routes are already admin-gated)
  isPublished: z.boolean().optional(),
});
