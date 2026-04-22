# kanban-backend

Backend NestJS para Kanban Platform. Arquitectura modular atómica, SOLID.

## Requisitos

- Node.js 20+
- pnpm 9+
- Docker (para infra local — ver `../kanban-infra`)

## Setup

```bash
# 1. Levantar infra (postgres, redis, minio)
cd ../kanban-infra && docker compose up -d && cd -

# 2. Instalar dependencias
pnpm install

# 3. Configurar env
cp .env.example .env

# 4. Aplicar schema
pnpm prisma:migrate

# 5. Arrancar en dev
pnpm start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/api/v1/health

## Estructura

```
src/
├── main.ts                    bootstrap
├── app.module.ts              composición raíz
├── config/                    env + Zod schema
├── common/                    guards/filters/interceptors (cross-cutting)
├── shared/                    utils puros
├── infrastructure/
│   └── prisma/                PrismaService (global)
└── modules/
    ├── health/                /health (básico)
    └── ...                    dominio (auth, boards, cards, …)
```

## Fases del roadmap

Este repo está en **Fase 1: Esqueleto**. Próximas: Auth+Users, dominio core, Activity+Invitations, Realtime.
