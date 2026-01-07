# Docker Setup for Mobile Service Manager

## Prerequisites
- Docker and Docker Compose installed

## Quick Start

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Data
```bash
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f redis
```

## Services

### PostgreSQL
- **Port**: 5432
- **Database**: mobile_service_manager
- **User**: postgres
- **Password**: postgres

### Redis
- **Port**: 6379

## Connection URLs

For use in `.env` files:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mobile_service_manager?schema=public"
REDIS_URL="redis://localhost:6379"
```
