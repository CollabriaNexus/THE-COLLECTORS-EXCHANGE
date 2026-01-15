import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().optional(),
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(6),
    phone: z.string().optional(),
    type: z.enum(['individual', 'company']).default('individual'),
    role: z.enum(['user', 'admin', 'curator']).default('user'),
    kycStatus: z.enum(['none', 'pending', 'verified']).default('none'),
    kycData: z.record(z.any()).optional(),
});

export const UserRegistrationSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    type: z.enum(['individual', 'company']).default('individual'),
    supabaseId: z.string().optional(),
});

export const UserKycSchema = z.object({
    userId: z.string(),
    kycData: z.record(z.any()),
});
