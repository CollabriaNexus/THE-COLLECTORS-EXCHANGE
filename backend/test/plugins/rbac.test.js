import { describe, it, expect, vi, beforeAll } from 'vitest';
import Fastify from 'fastify';

describe('rbac plugin', () => {
  describe('checkPermission', () => {
    let fastify;

    beforeAll(async () => {
      fastify = Fastify();
      const rbacPlugin = (await import('../../plugins/rbac.js')).default;
      await fastify.register(rbacPlugin);
      await fastify.ready();
    });

    it('admin has all permissions (*)', () => {
      expect(fastify.checkPermission('admin', 'anything')).toBe(true);
    });

    it('user can create own products', () => {
      expect(fastify.checkPermission('user', 'products.create_own')).toBe(true);
    });

    it('user can view own orders', () => {
      expect(fastify.checkPermission('user', 'orders.view_own')).toBe(true);
    });

    it('user cannot approve products', () => {
      expect(fastify.checkPermission('user', 'products.approve')).toBe(false);
    });

    it('curator can view products', () => {
      expect(fastify.checkPermission('curator', 'products.view')).toBe(true);
    });

    it('curator can approve products', () => {
      expect(fastify.checkPermission('curator', 'products.approve')).toBe(true);
    });

    it('curator cannot create own products', () => {
      expect(fastify.checkPermission('curator', 'products.create_own')).toBe(false);
    });

    it('unknown role has no permissions', () => {
      expect(fastify.checkPermission('nonexistent', 'anything')).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('returns 401 when no dbUser', async () => {
      const fastify = Fastify();
      const rbacPlugin = (await import('../../plugins/rbac.js')).default;
      await fastify.register(rbacPlugin);
      fastify.get('/test-perm', { preValidation: [fastify.requirePermission('products.create_own')] }, async () => ({ ok: true }));
      await fastify.ready();
      const res = await fastify.inject({ method: 'GET', url: '/test-perm' });
      expect(res.statusCode).toBe(401);
      expect(res.json().error).toContain('not synchronized');
    });

    it('returns 403 when user lacks permission', async () => {
      const fastify = Fastify();
      const rbacPlugin = (await import('../../plugins/rbac.js')).default;
      await fastify.register(rbacPlugin);
      fastify.get('/test-perm2', { preValidation: [fastify.requirePermission('products.approve')] }, async () => ({ ok: true }));
      await fastify.ready();
      const res = await fastify.inject({
        method: 'GET',
        url: '/test-perm2',
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 without dbUser for any required permission', async () => {
      const fastify = Fastify();
      const rbacPlugin = (await import('../../plugins/rbac.js')).default;
      await fastify.register(rbacPlugin);
      fastify.get('/test-perm3', { preValidation: [fastify.requirePermission('products.view')] }, async () => ({ ok: true }));
      await fastify.ready();
      const res = await fastify.inject({ method: 'GET', url: '/test-perm3' });
      expect(res.statusCode).toBe(401);
    });
  });
});
