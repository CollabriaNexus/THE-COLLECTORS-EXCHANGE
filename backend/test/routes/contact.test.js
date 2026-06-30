import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

describe('contact routes', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = {
      contactMessage: { create: vi.fn() },
    };
  });

  it('POST / creates a contact message', async () => {
    mockPrisma.contactMessage.create.mockResolvedValue({ id: 'c1' });
    const fastify = Fastify();
    fastify.decorate('prisma', mockPrisma);
    await fastify.register((await import('../../routes/contact.js')).default);
    await fastify.ready();
    const res = await fastify.inject({ method: 'POST', url: '/', payload: { name: 'John', email: 'john@test.com', subject: 'Help', message: 'Need assistance' } });
    expect(res.statusCode).toBe(200);
    expect(res.json().message).toContain('Thank you');
  });

  it('POST / returns 400 when fields missing', async () => {
    const fastify = Fastify();
    fastify.decorate('prisma', mockPrisma);
    await fastify.register((await import('../../routes/contact.js')).default);
    await fastify.ready();
    const res = await fastify.inject({ method: 'POST', url: '/', payload: { name: 'John' } });
    expect(res.statusCode).toBe(400);
  });
});
