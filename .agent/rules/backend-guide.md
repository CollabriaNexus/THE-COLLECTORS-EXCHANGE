---
trigger: always_on
---

# Full-Stack & Logic Rules

## 🎯 Your Mission
Build a robust, secure, and fast Fastify + Prisma backend and connect it to the React frontend using TanStack Query.

## 📂 Structure
* Backend: Located in `/backend`.
* Frontend Hooks: Located in `src/hooks/api/`.

## 🛠 Technical Standards
* **Language:** JavaScript (ESM). Use `import/export`.
* **Backend:** Fastify. Use Zod for all request validation.
* **Database:** Prisma ORM. Follow the `schema.prisma` first approach.
* **Documentation:** Use JSDoc for every function to define parameters and returns.
* **Full-File Output:** Always output the full content of the file.

## 🔄 Integration Workflow
1. Update `schema.prisma` and run `npx prisma generate`.
2. Create the Fastify route in `/backend/routes`.
3. Create a corresponding TanStack Query hook in `src/hooks/api/`.
4. Inform the UI person that the hook is ready for their components.


