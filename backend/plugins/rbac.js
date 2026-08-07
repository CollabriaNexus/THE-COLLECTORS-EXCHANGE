import fp from 'fastify-plugin';

export default fp(async function rbacPlugin(fastify, options) {
  const ROLE_PERMISSIONS = {
    user: ['products.create_own', 'products.update_own', 'products.delete_own', 'orders.view_own'],
    curator: ['products.view', 'products.approve', 'kyc.view', 'users.view', 'orders.view'],
    admin: ['*'],
  };

  fastify.decorate('checkPermission', function (role, permission) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  });

  fastify.decorate('requirePermission', function (permission) {
    return async function (request, reply) {
      if (!request.dbUser) {
        return reply.code(401).send({ error: 'User profile not synchronized' });
      }

      const hasPermission = fastify.checkPermission(request.dbUser.role, permission);
      if (!hasPermission) {
        return reply.code(403).send({ error: `Access denied: Missing permission '${permission}'` });
      }
    };
  });
});
