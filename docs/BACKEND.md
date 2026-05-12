# Backend Architecture — Kanban Platform

## Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS 10 |
| Lenguaje | TypeScript 5.9 |
| ORM | Prisma 7 + PostgreSQL |
| Auth | Passport + JWT (access 15m + refresh rotatorio 7d) |
| Tiempo real | Socket.IO + @nestjs/platform-socket.io |
| Validación | class-validator + class-transformer |
| Config | Zod schema validation |
| API Docs | Swagger (@nestjs/swagger) |
| Email | Resend |
| Storage | — (próximamente) |
| Logging | nestjs-pino + pino-http |
| Rate Limiting | @nestjs/throttler (3 tiers) |
| Seguridad | Helmet |
| Testing | Vitest + Supertest |
| Paquete | pnpm |

## Estructura del Proyecto

```
src/
├── main.ts                            # Bootstrap: NestFactory, Swagger, CORS, ValidationPipe
├── app.module.ts                      # Root module: imports, global JwtAuthGuard
├── config/
│   ├── config.module.ts               # Global config (@nestjs/config + Zod)
│   ├── env.schema.ts                  # Zod schema para env vars
│   └── typed-config.service.ts        # Typed wrapper de ConfigService
├── common/
│   ├── logging/logger.module.ts       # nestjs-pino (pretty dev, JSON prod)
│   └── throttler/throttler.module.ts  # Rate limiting
├── infrastructure/
│   ├── prisma/
│   │   ├── prisma.module.ts           # Global Prisma module
│   │   └── prisma.service.ts          # PrismaClient + pg adapter
│   ├── realtime/
│   │   ├── realtime.module.ts         # Global WebSocket module
│   │   ├── realtime.gateway.ts        # Socket.IO gateway (connection, rooms)
│   │   ├── realtime.service.ts        # Emit eventos a board rooms
│   │   ├── events.constants.ts        # Nombres de eventos
│   │   └── interfaces/socket-user.interface.ts
│   └── email/
│       ├── email.module.ts
│       └── email.service.ts           # Resend-based
├── modules/                           # Feature modules (DDD)
│   ├── auth/                          # Autenticación
│   │   ├── auth.module.ts
│   │   ├── controllers/auth.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts        # register, login, refresh, logout
│   │   │   ├── token.service.ts       # JWT issue/verify + refresh rotation
│   │   │   └── password-hasher.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── guards/jwt-auth.guard.ts   # Global guard (@Public() para eximir)
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── interfaces/
│   │   │   ├── token-payload.interface.ts
│   │   │   ├── auth-user.interface.ts
│   │   │   └── refresh-token-repository.interface.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       ├── refresh.dto.ts
│   │       └── auth-response.dto.ts
│   ├── users/                         # Usuarios
│   │   ├── users.module.ts
│   │   ├── controllers/users.controller.ts
│   │   ├── services/users.service.ts, users.repository.ts
│   │   ├── interfaces/users-repository.interface.ts, settings-json.types.ts
│   │   └── dto/
│   ├── boards/                        # Tableros
│   │   ├── boards.module.ts
│   │   ├── controllers/boards.controller.ts
│   │   ├── services/boards.service.ts, boards.repository.ts
│   │   ├── interfaces/boards-repository.interface.ts
│   │   └── dto/
│   ├── stages/                        # Etapas (columnas)
│   │   ├── stages.module.ts
│   │   ├── controllers/stages.controller.ts
│   │   ├── services/stages.service.ts, stages.repository.ts
│   │   ├── interfaces/stages-repository.interface.ts
│   │   └── dto/
│   ├── cards/                         # Tarjetas
│   │   ├── cards.module.ts
│   │   ├── controllers/cards.controller.ts
│   │   ├── services/cards.service.ts, cards.repository.ts
│   │   ├── interfaces/cards-repository.interface.ts, cards.tokens.ts
│   │   └── dto/
│   ├── members/                       # Membresías de tablero
│   │   ├── members.module.ts
│   │   ├── controllers/members.controller.ts
│   │   ├── services/
│   │   │   ├── members.service.ts
│   │   │   ├── members.repository.ts
│   │   │   └── board-access.service.ts
│   │   ├── guards/board-permission.guard.ts
│   │   ├── decorators/board-permission.decorator.ts
│   │   └── dto/
│   ├── labels/                        # Etiquetas
│   │   ├── labels.module.ts
│   │   ├── controllers/labels.controller.ts
│   │   ├── services/labels.service.ts, labels.repository.ts
│   │   └── dto/
│   ├── checklist/                     # Checklist items
│   │   ├── checklist.module.ts
│   │   ├── controllers/checklist.controller.ts
│   │   ├── services/checklist.service.ts, checklist.repository.ts
│   │   └── dto/
│   ├── comments/                      # Comentarios
│   │   ├── comments.module.ts
│   │   ├── controllers/comments.controller.ts
│   │   ├── services/comments.service.ts, comments.repository.ts
│   │   └── dto/
│   ├── invitations/                   # Invitaciones
│   │   ├── invitations.module.ts
│   │   ├── controllers/invitations.controller.ts
│   │   ├── services/invitations.service.ts, invitations.repository.ts
│   │   └── dto/
│   ├── activity/                      # Activity log
│   │   ├── activity.module.ts
│   │   ├── controllers/activity.controller.ts
│   │   ├── services/activity.service.ts, activity.repository.ts
│   │   └── dto/
│   └── health/                        # Health check
│       ├── health.module.ts
│       └── controllers/health.controller.ts
├── shared/
│   ├── position.util.ts               # Ordenamiento por Float
│   ├── duration.util.ts               # Parseo de duraciones
│   └── board-permissions.ts           # Constantes de permisos
└── generated/prisma/                  # Auto-generado por Prisma
    ├── client.ts
    ├── models.ts
    └── enums.ts
```

## API REST

**Base URL:** `/api/v1` | **Auth:** `Authorization: Bearer <JWT>` (excepto endpoints con `@Public()`)

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login -> access + refresh |
| POST | `/auth/refresh` | Rotación de refresh token |
| POST | `/auth/logout` | Revoca refresh |
| GET | `/auth/account` | Usuario autenticado |

### Users
| Método | Ruta |
|--------|------|
| GET/PATCH | `/users/account` |
| GET/PATCH | `/users/preferences` |

### Boards
| Método | Ruta |
|--------|------|
| GET | `/boards` |
| POST | `/boards` |
| GET | `/boards/:boardId/full` (incluye stages + cards) |
| PATCH/DELETE | `/boards/:boardId` |

### Stages
| Método | Ruta |
|--------|------|
| POST | `/boards/:boardId/stages` |
| PATCH/DELETE | `/stages/:stageId` |

### Cards
| Método | Ruta |
|--------|------|
| POST | `/stages/:stageId/cards` |
| GET/PATCH/DELETE | `/cards/:cardId` |
| PATCH | `/cards/:cardId/move` |
| POST/DELETE | `/cards/:cardId/members` |
| POST/PATCH/DELETE | `/cards/:cardId/checklist` |
| POST/DELETE | `/cards/:cardId/labels/:labelId` |

### Members
| Método | Ruta |
|--------|------|
| GET/PATCH/DELETE | `/boards/:boardId/members/:membershipId` |

### Labels
| Método | Ruta |
|--------|------|
| POST | `/boards/:boardId/labels` |
| DELETE | `/labels/:labelId` |

### Comments
| Método | Ruta |
|--------|------|
| GET/POST/DELETE | `/cards/:cardId/comments` |

### Invitations
| Método | Ruta |
|--------|------|
| POST | `/boards/:boardId/invitations` |
| GET | `/invitations/pending` |
| POST | `/invitations/:token/accept` |

### Activity
| Método | Ruta |
|--------|------|
| GET | `/boards/:boardId/activity` |

### Health
| GET | `/health` | Health check |

## Database Schema (Prisma + PostgreSQL)

### Modelos (14)

| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| **User** | id, email, name, username, passwordHash, avatarUrl, roles | -> UserProfile, UserPreference, BoardMembership, RefreshToken |
| **UserProfile** | id, profile (JSON) | belongs-to User |
| **UserPreference** | id, settings (JSON) | belongs-to User |
| **Board** | id, name, background | -> BoardMembership, Stage, Label, Activity, Invitation, BoardPreference |
| **BoardPreference** | id, settings (JSON) | belongs-to Board |
| **BoardMembership** | id, boardId, userId, role (enum), permissions[] | belongs-to Board + User; -> CardMember, Comment, Activity |
| **Stage** | id, boardId, name, position (Float) | belongs-to Board; -> Card |
| **Label** | id, boardId, name, color | belongs-to Board; -> CardLabel |
| **Card** | id, stageId, title, description, position (Float), startDate, dueDate | belongs-to Stage; -> CardLabel, CardMember, ChecklistItem, Comment |
| **ChecklistItem** | id, cardId, text, done, position | belongs-to Card |
| **CardLabel** | cardId, labelId (composite PK) | M:N Card <-> Label |
| **CardMember** | cardId, boardMembershipId (composite PK) | M:N Card <-> BoardMembership |
| **Comment** | id, cardId, authorId, body | belongs-to Card + BoardMembership |
| **Activity** | id, boardId, userId, type, detail, meta (JSON) | belongs-to Board + BoardMembership |
| **RefreshToken** | id, userId, tokenHash, expiresAt, revokedAt | belongs-to User |
| **Invitation** | id, boardId, email, role, token, expiresAt, acceptedAt | belongs-to Board |

### Enums
- `BoardRole`: `owner`, `admin`, `member`

### Índices clave
- `Card(stageId, position)` — orden eficiente por stage
- `Stage(boardId, position)` — orden eficiente por board
- `Activity(boardId, createdAt DESC)` — feed rápido
- `BoardMember(userId)` — consultas por usuario
- `Card(dueDate)` — filtros por fecha

## Tiempo Real (Socket.IO)

**Conexión:** Handshake con JWT en `auth.token`

**Eventos servidor -> cliente:**
- `board:updated | board:deleted`
- `stage:created | stage:updated | stage:deleted`
- `card:created | card:updated | card:moved | card:deleted`
- `card:member_added | member_removed`
- `checklist:changed`
- `activity:new`
- `member:joined | member:left | member:role_changed`

**Comandos cliente -> servidor:**
- `board:join` (verifica membresía, une a room `board:{boardId}`)
- `board:leave`

**Flujo:** Tras cada mutación REST exitosa, el servicio emite vía `RealtimeService.emitToBoard()` al room correspondiente.

## Autenticación y Autorización

| Capa | Mecanismo |
|------|-----------|
| **Auth** | JWT access (15m) + refresh rotatorio (7d) con SHA-256 en DB |
| **Global guard** | `JwtAuthGuard` protege todas las rutas (eximidas con `@Public()`) |
| **Board access** | `BoardAccessService.requireMembership()` verifica membresía |
| **Permisos** | `BoardPermissionGuard` + `@BoardPermission()` para control granular |
| **Roles** | `owner`, `admin`, `member` definidos en enum `BoardRole` |

## Patrones Arquitectónicos

1. **Module-per-Domain** — Cada módulo NestJS sigue DDD: `controller -> service -> repository`
2. **Repository Pattern** — Interfaces basadas en tokens (ej. `IBoardsRepository`) para testabilidad
3. **DTO Layer** — `class-validator` con whitelisting y transform vía `ValidationPipe` global
4. **Float-based Positioning** — Stages y cards ordenados por `Float` (evita re-numeraciones complejas)
5. **REST + Pub/Sub** — Cada mutación REST emite evento WebSocket al board room
6. **Refresh Token Rotation** — Cada refresh emite nuevo par e invalida el anterior

## Infraestructura Global

| Módulo | Propósito |
|--------|-----------|
| `PrismaModule` | Cliente Prisma con adaptador PostgreSQL (`@prisma/adapter-pg`) |
| `RealtimeModule` | Gateway Socket.IO + servicio de emisión |
| `EmailModule` | Servicio de email vía Resend |
| `AppLoggerModule` | Logging estructurado con nestjs-pino (request IDs) |
| `AppThrottlerModule` | Rate limiting (3 tiers: 1s/10, 60s/100, 1h/2000) |
| `AppConfigModule` | Config con validación Zod de env vars |

## Configuración (Entorno)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Firma de access tokens |
| `JWT_REFRESH_SECRET` | Firma de refresh tokens |
| `CORS_ORIGINS` | Orígenes permitidos (coma-separados) |
| `API_PREFIX` | Prefijo global (default: `api/v1`) |
| `PORT` | Puerto (default: 3000) |
| `RESEND_API_KEY` | API key de Resend |
| (próximamente) | Almacenamiento de archivos |

## Despliegue

- Script `build:render`: `install -> reset DB -> generate prisma -> migrate -> seed -> build`
- Swagger docs disponibles en `/docs`
- Producción desplegado en Render: `https://kanban-server-zpq5.onrender.com`
