# Mobile Service Manager - Micro SaaS

A complete, production-ready monorepo for managing mobile service clients. Built with modern technologies and best practices for multi-tenant SaaS applications.

See [README.md](./README.md) for full documentation.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services
cd docker && docker compose up -d && cd ..

# 3. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Generate Prisma client
pnpm prisma:generate

# 5. Run migrations
pnpm prisma:migrate

# 6. Start development servers
pnpm dev
```

Application will be available at:
- **API**: http://localhost:3000
- **Web**: http://localhost:5173
