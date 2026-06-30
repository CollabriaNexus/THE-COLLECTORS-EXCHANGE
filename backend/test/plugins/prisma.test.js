import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: vi.fn().mockResolvedValue(),
    $disconnect: vi.fn().mockResolvedValue(),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

describe('prisma plugin', () => {
  let fastify;

  beforeAll(async () => {
    fastify = Fastify();
    const prismaPlugin = (await import('../../plugins/prisma.js')).default;
    await fastify.register(prismaPlugin);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('decorates fastify with prisma', () => {
    expect(fastify.prisma).toBeDefined();
  });

  it('calls $connect on startup', async () => {
    const { PrismaClient } = await import('@prisma/client');
    expect(PrismaClient).toHaveBeenCalled();
  });

  it('disconnects on close', async () => {
    const disconnectSpy = vi.spyOn(fastify.prisma, '$disconnect');
    await fastify.close();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
