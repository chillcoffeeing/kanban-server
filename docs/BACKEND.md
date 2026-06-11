# Backend Architecture — Kanban Platform

## Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS 10 (`^10.4.0`) |
| Lenguaje | TypeScript 5.9 (`^5.9.3`) |
| ORM | Prisma 7 (`^7.8.0`) + PostgreSQL (`pg`, `@prisma/adapter-pg`) |
| Auth | Passport + JWT (access 15m + refresh rotatorio 7d) |
| Tiempo real | Socket.IO + `@nestjs/platform-socket.io` |
| Validación | class-validator + class-transformer |
| Config | Zod (`^3.23.8`) vía `@nestjs/config` |
| API Docs | Swagger (`@nestjs/swagger ^7.4.0`) |
| Email | Resend (`^4.8.0`) |
| File Storage | AWS S3 (`@aws-sdk/client-s3`) + multer (`^2.1.1`) |
| Logging | nestjs-pino + pino-http |
| Rate Limiting | `@nestjs/throttler` (3 tiers) |
| Seguridad | Helmet |
| Eventos | `@nestjs/event-emitter` (domain events) |
| Scheduling | `@nestjs/schedule` (cron jobs) |
| Health | `@nestjs/terminus` |
| Testing | Vitest + Supertest |
| Paquete | pnpm |

## Estructura del Proyecto

```
src/
├── main.ts                              # Bootstrap: NestFactory, Swagger, CORS, ValidationPipe
├── app.module.ts                        # Root module: imports, global JwtAuthGuard
├── config/
│   ├── config.module.ts                 # Global config (@nestjs/config + Zod)
│   ├── env.schema.ts                    # Zod schema para env vars
│   └── typed-config.service.ts          # Typed wrapper de ConfigService
├── common/
│   ├── logging/logger.module.ts         # nestjs-pino (pretty dev, JSON prod)
│   └── throttler/throttler.module.ts    # Rate limiting (3 tiers)
├── infrastructure/
│   ├── prisma/
│   │   ├── prisma.module.ts             # Global Prisma module
│   │   └── prisma.service.ts            # PrismaClient + pg adapter
│   ├── realtime/
│   │   ├── realtime.module.ts           # Global WebSocket module
│   │   ├── realtime.gateway.ts          # Socket.IO gateway (connection, rooms)
│   │   ├── realtime.service.ts          # Emit eventos a board rooms
│   │   ├── realtime.listener.ts         # Escucha domain events y emite vía WebSocket
│   │   ├── events.constants.ts          # Nombres de eventos
│   │   └── interfaces/socket-user.interface.ts
│   ├── email/
│   │   ├── email.module.ts
│   │   └── email.service.ts             # Resend-based
│   └── filters/
│       └── http-exception.filter.ts     # Global HTTP exception filter
├── modules/                             # Feature modules (DDD)
│   ├── auth/                            # Autenticación
│   │   ├── auth.module.ts
│   │   ├── controllers/auth.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts          # register, login, refresh, logout
│   │   │   ├── token.service.ts         # JWT issue/verify + refresh rotation
│   │   │   ├── password-hasher.service.ts
│   │   │   └── refresh-token.repository.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── guards/jwt-auth.guard.ts     # Global guard (@Public() para eximir)
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
│   ├── users/                           # Usuarios
│   │   ├── users.module.ts
│   │   ├── controllers/users.controller.ts
│   │   ├── services/users.service.ts, users.repository.ts
│   │   ├── interfaces/users-repository.interface.ts, settings-json.types.ts
│   │   └── dto/
│   │       ├── user-response.dto.ts
│   │       ├── profile-response.dto.ts
│   │       ├── preferences-response.dto.ts
│   │       ├── update-profile.dto.ts
│   │       ├── update-preferences.dto.ts
│   │       └── change-password.dto.ts
│   ├── boards/                          # Tableros
│   │   ├── boards.module.ts
│   │   ├── controllers/boards.controller.ts
│   │   ├── services/boards.service.ts, boards.repository.ts
│   │   ├── interfaces/boards-repository.interface.ts
│   │   └── dto/
│   │       ├── board-response.dto.ts
│   │       ├── create-board.dto.ts
│   │       ├── update-board.dto.ts
│   │       └── update-preferences.dto.ts
│   ├── stages/                          # Etapas (columnas)
│   │   ├── stages.module.ts
│   │   ├── controllers/stages.controller.ts
│   │   ├── services/stages.service.ts, stages.repository.ts
│   │   ├── interfaces/stages-repository.interface.ts
│   │   └── dto/
│   │       ├── create-stage.dto.ts
│   │       ├── update-stage.dto.ts
│   │       └── stage-response.dto.ts
│   ├── cards/                           # Tarjetas
│   │   ├── cards.module.ts
│   │   ├── controllers/cards.controller.ts
│   │   ├── services/cards.service.ts, cards.repository.ts
│   │   ├── interfaces/
│   │   │   ├── cards-repository.interface.ts
│   │   │   └── cards.tokens.ts
│   │   └── dto/
│   │       ├── card-response.dto.ts
│   │       ├── create-card.dto.ts
│   │       ├── update-card.dto.ts
│   │       └── move-card.dto.ts
│   ├── members/                         # Membresías de tablero
│   │   ├── members.module.ts
│   │   ├── controllers/members.controller.ts
│   │   ├── services/
│   │   │   ├── members.service.ts
│   │   │   ├── members.repository.ts
│   │   │   └── board-access.service.ts
│   │   ├── guards/board-permission.guard.ts
│   │   ├── decorators/board-permission.decorator.ts
│   │   └── dto/
│   │       ├── member-response.dto.ts
│   │       └── update-member.dto.ts
│   ├── labels/                          # Etiquetas
│   │   ├── labels.module.ts
│   │   ├── controllers/labels.controller.ts
│   │   ├── services/labels.service.ts, labels.repository.ts
│   │   ├── interfaces/labels-repository.interface.ts
│   │   └── dto/
│   │       ├── create-label.dto.ts
│   │       └── label-response.dto.ts
│   ├── checklist/                       # Checklist items
│   │   ├── checklist.module.ts
│   │   ├── controllers/checklist.controller.ts
│   │   ├── services/checklist.service.ts, checklist.repository.ts
│   │   ├── interfaces/checklist-repository.interface.ts
│   │   └── dto/checklist.dto.ts
│   ├── comments/                        # Comentarios
│   │   ├── comments.module.ts
│   │   ├── controllers/comments.controller.ts
│   │   ├── services/comments.service.ts, comments.repository.ts
│   │   ├── interfaces/comments-repository.interface.ts
│   │   └── dto/comment.dto.ts
│   ├── invitations/                     # Invitaciones
│   │   ├── invitations.module.ts
│   │   ├── controllers/invitations.controller.ts
│   │   ├── services/invitations.service.ts, invitations.repository.ts
│   │   ├── interfaces/invitations-repository.interface.ts
│   │   └── dto/invitation.dto.ts
│   ├── activity/                        # Activity log
│   │   ├── activity.module.ts
│   │   ├── controllers/activity.controller.ts
│   │   ├── services/
│   │   │   ├── activity.service.ts
│   │   │   ├── activity.repository.ts
│   │   │   └── activity-cleanup.service.ts  # Cron job de limpieza
│   │   ├── interfaces/activity-repository.interface.ts
│   │   ├── dto/activity.dto.ts
│   │   └── activity.listener.ts            # Escucha domain events de actividad
│   ├── permission-requests/             # Solicitudes de permiso
│   │   ├── permission-requests.module.ts
│   │   ├── controllers/permission-requests.controller.ts
│   │   ├── services/
│   │   │   ├── permission-requests.service.ts
│   │   │   └── permission-requests.repository.ts
│   │   ├── interfaces/permission-requests-repository.interface.ts
│   │   └── dto/permission-request.dto.ts
│   └── health/                          # Health check
│       ├── health.module.ts
│       └── controllers/health.controller.ts
├── shared/
│   ├── position.util.ts                 # Ordenamiento por Float
│   ├── duration.util.ts                 # Parseo de duraciones
│   ├── board-permissions.ts             # Constantes de permisos
│   └── events/
│       └── domain.events.ts             # Domain event classes
└── generated/prisma/                    # Auto-generado por Prisma
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
| PATCH | `/users/password` |

### Boards
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/boards` | Listar boards del usuario |
| POST | `/boards` | Crear board |
| GET | `/boards/:boardId/full` | Board + stages + cards |
| PATCH/DELETE | `/boards/:boardId` | Actualizar/eliminar |

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
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/boards/:boardId/activity` | Feed de actividad |

### Permission Requests
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/boards/:boardId/permission-requests` | Solicitar permiso |
| GET | `/boards/:boardId/permission-requests` | Listar solicitudes (owner) |
| PATCH | `/boards/:boardId/permission-requests/:id` | Aprobar/rechazar |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check (público) |

## Database Schema (Prisma + PostgreSQL)

### Enums (2)

| Enum | Valores |
|------|---------|
| `BoardRole` | `owner`, `member` |
| `PermissionRequestStatus` | `pending`, `approved`, `rejected` |

### Modelos (15)

| Modelo | Tabla | Campos clave | Relaciones |
|--------|-------|-------------|------------|
| **User** | `users` | id, email (unique), name, username (unique, optional), passwordHash, avatarUrl, lastLoginAt | -> UserProfile, UserPreference, BoardMembership[], RefreshToken[] |
| **UserProfile** | `profiles` | id, profile (JSON), userId (unique FK) | belongs-to User |
| **UserPreference** | `user_preference` | id, settings (JSON), userId (unique FK) | belongs-to User |
| **Board** | `boards` | id, name, background | -> BoardMembership[], Stage[], Label[], Activity[], Invitation[], PermissionRequest[], BoardPreference |
| **BoardPreference** | `board_preference` | id, settings (JSON), boardId (unique FK) | belongs-to Board |
| **BoardMembership** | `board_members` | id, boardId, userId, role (BoardRole), permissions (String[]), invitedAt | belongs-to Board + User; -> CardMember[], Comment[], Activity[], PermissionRequest[] |
| **Stage** | `stages` | id, boardId, name, position (Float) | belongs-to Board; -> Card[] |
| **Label** | `labels` | id, boardId, name, color | belongs-to Board; -> CardLabel[] |
| **Card** | `cards` | id, stageId, title, description, position (Float), startDate, dueDate | belongs-to Stage; -> CardLabel[], CardMember[], ChecklistItem[], Comment[] |
| **ChecklistItem** | `checklist_items` | id, cardId, text, done, position (Float) | belongs-to Card |
| **CardLabel** | `card_labels` | cardId + labelId (composite PK) | M:N Card <-> Label |
| **CardMember** | `card_members` | cardId + boardMembershipId (composite PK) | M:N Card <-> BoardMembership |
| **Comment** | `comments` | id, cardId, authorId (FK -> BoardMembership), body | belongs-to Card + BoardMembership |
| **Activity** | `activities` | id, boardId, membershipId (nullable FK), userName, type, detail, meta (JSON), createdAt | belongs-to Board + optional BoardMembership |
| **RefreshToken** | `refresh_tokens` | id, userId (FK), tokenHash (unique), expiresAt, revokedAt | belongs-to User |
| **Invitation** | `invitations` | id, boardId, email, role (BoardRole), token (unique), expiresAt, acceptedAt | belongs-to Board |
| **PermissionRequest** | `permission_requests` | id, boardId, requesterId (FK -> BoardMembership), permission, status (PermissionRequestStatus) | belongs-to Board + BoardMembership |

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
- `permission_request:new | permission_request:updated`

**Comandos cliente -> servidor:**
- `board:join` (verifica membresía, une a room `board:{boardId}`)
- `board:leave`

**Flujo:** Tras cada mutación REST exitosa, el servicio emite un domain event (`@nestjs/event-emitter`). `RealtimeListener` escucha y reenvía vía `RealtimeService.emitToBoard()` al room correspondiente.

## Autenticación y Autorización

| Capa | Mecanismo |
|------|-----------|
| **Auth** | JWT access (15m) + refresh rotatorio (7d) con SHA-256 en DB |
| **Global guard** | `JwtAuthGuard` protege todas las rutas (eximidas con `@Public()`) |
| **Board access** | `BoardAccessService.requireMembership()` verifica membresía |
| **Permisos** | `BoardPermissionGuard` + `@BoardPermission()` para control granular |
| **Roles** | `owner`, `member` definidos en enum `BoardRole` (admin eliminado) |

## Patrones Arquitectónicos

1. **Module-per-Domain** — Cada módulo NestJS sigue DDD: `controller -> service -> repository`
2. **Repository Pattern** — Interfaces basadas en tokens para testabilidad
3. **DTO Layer** — `class-validator` con whitelisting y transform vía `ValidationPipe` global
4. **Float-based Positioning** — Stages y cards ordenados por `Float` (evita re-numeraciones complejas)
5. **REST + Domain Events + WebSocket** — Cada mutación REST publica un domain event (`@nestjs/event-emitter`), que es escuchado por `RealtimeListener` y reemitido al board room via Socket.IO
6. **Refresh Token Rotation** — Cada refresh emite nuevo par e invalida el anterior
7. **Cron-based Cleanup** — `ActivityCleanupService` elimina actividad antigua periódicamente via `@nestjs/schedule`

## Infraestructura Global

| Módulo | Propósito |
|--------|-----------|
| `PrismaModule` | Cliente Prisma con adaptador PostgreSQL (`@prisma/adapter-pg`) |
| `RealtimeModule` | Gateway Socket.IO + servicio de emisión + listener de domain events |
| `EmailModule` | Servicio de email vía Resend |
| `AppLoggerModule` | Logging estructurado con nestjs-pino (request IDs) |
| `AppThrottlerModule` | Rate limiting (3 tiers: 1s/10, 60s/100, 1h/2000) |
| `AppConfigModule` | Config con validación Zod de env vars |
| `HttpExceptionFilter` | Global exception filter para respuestas de error estandarizadas |

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
| `AWS_ACCESS_KEY_ID` | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key |
| `AWS_REGION` | Región S3 |
| `AWS_BUCKET_NAME` | Bucket S3 para archivos |

## Despliegue

- Script `build:render`: `install -> generate prisma -> migrate -> seed -> build`
- Swagger docs disponibles en `/docs`
- Producción desplegado en Render: `https://kanban-server-zpq5.onrender.com`
