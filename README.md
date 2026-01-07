# Mobile Service Manager - Micro SaaS

A complete, production-ready monorepo for managing mobile service clients. Built with modern technologies and best practices for multi-tenant SaaS applications.

## 🚀 Features

- **Multi-tenant Architecture**: Each business has isolated data with businessId scoping
- **Authentication**: Secure JWT-based auth with HttpOnly cookies
- **Client Management**: Full CRUD operations with search and archive functionality
- **Modern Stack**: React, TypeScript, Fastify, Prisma, PostgreSQL, Redis
- **Monorepo Setup**: pnpm workspaces for efficient dependency management

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v8 or higher
- **Docker & Docker Compose**: For running PostgreSQL and Redis

## 🏗️ Repository Structure

```
micro-saas/
├── apps/
│   ├── api/          # Fastify backend API
│   ├── web/          # React frontend
│   └── worker/       # Background worker (scaffold)
├── packages/
│   └── shared/       # Shared types and utilities
├── docker/           # Docker configuration
├── prisma/           # Database schema and migrations
├── package.json      # Root package.json
└── pnpm-workspace.yaml
```

## 🚦 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Docker Services

```bash
cd docker
docker compose up -d
cd ..
```

This will start:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Configure Environment Variables

```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit the files if needed (defaults work for local development).

### 4. Generate Prisma Client

```bash
pnpm prisma:generate
```

### 5. Run Database Migrations

```bash
pnpm prisma:migrate
```

### 6. Start Development Servers

```bash
pnpm dev
```

This will start:
- **API**: http://localhost:3000
- **Web**: http://localhost:5173

## 📦 Available Scripts

### Root Scripts

- `pnpm dev` - Start both API and web in development mode
- `pnpm dev:api` - Start only the API server
- `pnpm dev:web` - Start only the web app
- `pnpm dev:worker` - Start the worker
- `pnpm build` - Build all packages
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm clean` - Clean all node_modules and build artifacts

### Individual Package Scripts

Each app/package has its own scripts. See their respective `package.json` files.

## 🗄️ Database Schema

### Business
- Multi-tenant root entity
- Contains name, timezone, identifierLabel

### User
- Belongs to a Business
- Email/password authentication
- One admin user per business (extensible)

### Client
- Belongs to a Business
- Full contact information
- Support for archiving
- Do Not Contact flag

## 🔐 Authentication

- JWT tokens stored in HttpOnly cookies (7-day expiration)
- `credentials: "include"` on all API requests
- Automatic token verification on protected routes
- Multi-tenant data isolation by businessId

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- React Router v6
- Vite
- Inline CSS (production-ready styling)

### Backend
- Fastify 4
- TypeScript
- Prisma ORM
- Zod validation
- bcrypt for password hashing
- jsonwebtoken for JWT

### Database
- PostgreSQL 16
- Redis 7 (for future use)

### DevOps
- Docker & Docker Compose
- pnpm workspaces
- TypeScript project references

## 📝 API Endpoints

### Auth Routes

```
POST   /auth/register     - Create new business + user
POST   /auth/login        - Login
POST   /auth/logout       - Logout
GET    /auth/me           - Get current user
```

### Client Routes (Protected)

```
GET    /clients           - List clients (with search & archive filter)
POST   /clients           - Create client
GET    /clients/:id       - Get client
PATCH  /clients/:id       - Update client
POST   /clients/:id/archive   - Archive client
POST   /clients/:id/unarchive - Unarchive client
```

### Health Check

```
GET    /health            - API health check
```

## 🌐 Frontend Routes

```
/login                 - Login page
/signup                - Signup page
/app/clients           - Clients list
/app/clients/new       - Add new client
/app/clients/:id       - Edit client
/app/dashboard         - Dashboard (placeholder)
/app/bookings          - Bookings (placeholder)
/app/more              - More (placeholder)
```

## 🔧 Development

### Database Management

```bash
# View database in Prisma Studio
pnpm prisma:studio

# Create a new migration
pnpm prisma:migrate

# Reset database (warning: deletes all data)
cd apps/api && npx prisma migrate reset
```

### Docker Management

```bash
# View logs
cd docker && docker compose logs -f

# Stop services
docker compose down

# Stop and remove data
docker compose down -v
```

## 🏭 Production Deployment

### Build

```bash
pnpm build
```

### Environment Variables

Ensure all production environment variables are set:

**API (.env)**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV=production`

**Web (.env)**
- `VITE_API_URL` - API server URL

### Database

Run migrations in production:

```bash
cd apps/api && npx prisma migrate deploy
```

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens in HttpOnly cookies (no localStorage)
- CORS configured for specific origins
- Multi-tenant data isolation
- Input validation with Zod
- SQL injection protection via Prisma

## 📚 Architecture Decisions

### Why Monorepo?
- Shared types between frontend and backend
- Single version control
- Easier refactoring across packages

### Why Fastify?
- Modern, fast, and TypeScript-friendly
- Plugin architecture
- Great performance

### Why Prisma?
- Type-safe database access
- Excellent migrations
- Great developer experience

### Why pnpm?
- Fast and efficient
- Better disk space usage
- Strict dependency resolution

## 🤝 Contributing

This is a production-ready starter template. Feel free to fork and customize for your needs.

## 📄 License

MIT

## 🎯 Roadmap (Future Enhancements)

- [ ] Email notifications
- [ ] SMS integration
- [ ] Calendar/booking system
- [ ] Invoice generation
- [ ] Multi-user support with roles
- [ ] API rate limiting
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline
