#!/usr/bin/env node
/**
 * Seeder de desarrollo: 3 usuarios colaborando en 1 tablero "Frontend Redesign".
 * Idempotente por email: salta creacion si el usuario ya existe (hace login).
 *
 * Uso: node scripts/seed-dev.mjs
 * Opcional: RESET=1 para borrar el board "Frontend Redesign" antes de re-crearlo.
 */

const apiBaseUrl = process.env.API_BASE ?? 'http://localhost:3000/api/v1';
const shouldReset = process.env.RESET === '1';

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function httpRequest(method, path, { token, body, expect } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const rawText = await response.text();
  const parsedBody = rawText ? safeJsonParse(rawText) : null;
  if (expect && response.status !== expect) {
    throw new Error(`${method} ${path} respondio ${response.status}\n${rawText}`);
  }
  return { status: response.status, data: parsedBody };
}

async function ensureUser({ email, name, password }) {
  const registerResponse = await httpRequest('POST', '/auth/register', {
    body: { email, name, password },
  });
  if (registerResponse.status === 201 || registerResponse.status === 200) {
    return { user: registerResponse.data.user, token: registerResponse.data.accessToken };
  }
  const loginResponse = await httpRequest('POST', '/auth/login', {
    body: { email, password },
    expect: 200,
  });
  return { user: loginResponse.data.user, token: loginResponse.data.accessToken };
}

const seedUsers = [
  { email: 'alice@kanban.dev', name: 'Alice Martin',    password: 'Passw0rd!', role: 'Tech Lead' },
  { email: 'bob@kanban.dev',   name: 'Bob Navarro',     password: 'Passw0rd!', role: 'Frontend Dev' },
  { email: 'carol@kanban.dev', name: 'Carol Rodriguez', password: 'Passw0rd!', role: 'UX Designer' },
];

const stageNames = ['Backlog', 'In Progress', 'Review', 'Done'];

// Cards repartidas por stage. Cada card tiene titulo y descripcion coherentes.
const cardPlan = [
  // Backlog (stage 0)
  { stageIndex: 0, title: 'Auditoria de accesibilidad (WCAG 2.1 AA)',
    description: 'Revisar contraste, navegacion por teclado y roles ARIA en todas las vistas principales.',
    ownerIndex: 2 },
  { stageIndex: 0, title: 'Migrar iconografia a Phosphor Icons',
    description: 'Reemplazar lucide-react por @phosphor-icons/react y normalizar tamanos.',
    ownerIndex: 1 },
  { stageIndex: 0, title: 'Definir design tokens en Tailwind v4',
    description: 'Colores, tipografia, radios y sombras centralizados; documentar en docs/FRONTEND.md.',
    ownerIndex: 2 },
  { stageIndex: 0, title: 'Historial de actividad del tablero',
    description: 'Mostrar feed en la sidebar con eventos recientes (create/move/comment).',
    ownerIndex: 0 },

  // In Progress (stage 1)
  { stageIndex: 1, title: 'Drag and drop entre etapas con @dnd-kit',
    description: 'Reescritura del kanban board para soportar reordenado y cross-stage move con persistencia optimista.',
    ownerIndex: 1 },
  { stageIndex: 1, title: 'Modal de detalle de tarjeta',
    description: 'Labels, checklist, adjuntos y comentarios editables. Estado derivado del store central.',
    ownerIndex: 1 },
  { stageIndex: 1, title: 'Integrar autenticacion JWT',
    description: 'Capa services/api.ts con interceptor y refresh. Sustituir el mock de localStorage.',
    ownerIndex: 0 },

  // Review (stage 2)
  { stageIndex: 2, title: 'Filtros por miembro y label',
    description: 'Query params en URL; estado sincronizado con el store. Pendiente de revision UX.',
    ownerIndex: 0 },
  { stageIndex: 2, title: 'Refactor del sidebar colapsable',
    description: 'Extraer <Sidebar /> y persistir estado collapsed por usuario. Listo para review de Alice.',
    ownerIndex: 2 },

  // Done (stage 3)
  { stageIndex: 3, title: 'Setup inicial Vite + React 19',
    description: 'Scaffolding, alias @/*, ESLint flat config y Tailwind v4.',
    ownerIndex: 0 },
  { stageIndex: 3, title: 'Estructura de rutas',
    description: 'Landing, login, board, settings. Guard de autenticacion.',
    ownerIndex: 0 },
  { stageIndex: 3, title: 'Tema oscuro con toggle',
    description: 'Toggle persistido en preferencias del usuario; tokens para ambos modos.',
    ownerIndex: 2 },
];

async function main() {
  console.log(`Seeder dev - ${apiBaseUrl}\n`);

  // 1. Crear o login de los 3 usuarios
  const accounts = [];
  for (const seedUser of seedUsers) {
    const account = await ensureUser(seedUser);
    accounts.push({ ...seedUser, ...account });
    console.log(`${seedUser.name.padEnd(22)} ${seedUser.email}  id=${account.user.id.slice(0, 8)}`);
  }

  const [aliceAccount, bobAccount, carolAccount] = accounts;

  // 2. Reset opcional: borrar board existente con el mismo nombre
  const boardName = 'Frontend Redesign Q2';
  if (shouldReset) {
    const { data: existingBoards } = await httpRequest('GET', '/boards', { token: aliceAccount.token });
    for (const existingBoard of existingBoards ?? []) {
      if (existingBoard.name === boardName && existingBoard.ownerId === aliceAccount.user.id) {
        await httpRequest('DELETE', `/boards/${existingBoard.id}`, {
          token: aliceAccount.token,
          expect: 204,
        });
        console.log(`[reset] board previo borrado (${existingBoard.id.slice(0, 8)})`);
      }
    }
  }

  // 3. Alice crea el tablero
  const { data: createdBoard } = await httpRequest('POST', '/boards', {
    token: aliceAccount.token,
    body: {
      name: boardName,
      background: 'bg-gradient-to-br from-indigo-500 to-violet-700',
    },
  });
  console.log(`\nBoard "${createdBoard.name}" id=${createdBoard.id}`);

  // 4. Invitar a Bob (admin) y Carol (member) y aceptar
  const invitations = [
    { account: bobAccount,   role: 'admin'  },
    { account: carolAccount, role: 'member' },
  ];
  for (const invitation of invitations) {
    const { data: createdInvitation } = await httpRequest('POST', `/boards/${createdBoard.id}/invitations`, {
      token: aliceAccount.token,
      body: { email: invitation.account.email, role: invitation.role },
    });
    await httpRequest('POST', `/invitations/${createdInvitation.token}/accept`, {
      token: invitation.account.token,
      expect: 200,
    });
    console.log(`${invitation.account.name} acepto invitacion (${invitation.role})`);
  }

  // 5. Crear stages
  const stageIds = [];
  for (const stageName of stageNames) {
    const { data: createdStage } = await httpRequest('POST', `/boards/${createdBoard.id}/stages`, {
      token: aliceAccount.token,
      body: { name: stageName },
    });
    stageIds.push(createdStage.id);
  }
  console.log(`\nStages: ${stageNames.join(', ')}`);

  // 6. Crear cards segun el plan, usando el token del owner correspondiente
  console.log(`\nCards:`);
  for (const plannedCard of cardPlan) {
    const author = accounts[plannedCard.ownerIndex];
    const cardResponse = await httpRequest('POST', `/stages/${stageIds[plannedCard.stageIndex]}/cards`, {
      token: author.token,
      body: { title: plannedCard.title, description: plannedCard.description },
    });
    if (cardResponse.status !== 201 && cardResponse.status !== 200) {
      console.error(`[FAIL] ${plannedCard.title} respondio ${cardResponse.status}`, cardResponse.data);
      continue;
    }
    console.log(`  [${stageNames[plannedCard.stageIndex].padEnd(11)}] ${plannedCard.title}  by ${author.name.split(' ')[0]}`);
    // Evitar el throttler de ventana corta (10 req/s por IP)
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  console.log(`\nSeed completo. Login con alice@kanban.dev / Passw0rd!`);
}

main().catch((error) => {
  console.error('\n', error.message);
  process.exit(1);
});
