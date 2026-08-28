import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateQrCodeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(80),
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(slugRegex, 'Slug may only contain lowercase letters, numbers and hyphens')
    .optional(),
  targetUrl: z.string().url('targetUrl must be a valid URL').max(2048),
  active: z.boolean().optional().default(true),
});

export const UpdateQrCodeSchema = z.object({
  title: z.string().min(2).max(80).optional(),
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(slugRegex, 'Slug may only contain lowercase letters, numbers and hyphens')
    .optional(),
  targetUrl: z.string().url('targetUrl must be a valid URL').max(2048).optional(),
  active: z.boolean().optional(),
});

export const QrIdParamSchema = z.object({
  id: z.string().min(1),
});

export const QrStatsQuerySchema = z.object({
  codeId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  deviceType: z.string().max(40).optional(),
  os: z.string().max(60).optional(),
});

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
