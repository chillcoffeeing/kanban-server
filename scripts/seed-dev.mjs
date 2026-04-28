#!/usr/bin/env node
/**
 * Seeder de desarrollo: 2 boards, 5 usuarios, relaciones coherentes.
 *
 * Board 1: "Frontend Redesign" (Owner: Alice)
 *   - Members: Alice (owner), Bob (admin), Carol (member), Dave (member)
 *   - 6 cards con labels, checklists, members, descriptions
 *   - Pending invitation: Eve
 *
 * Board 2: "Mobile App MVP" (Owner: Bob)
 *   - Members: Bob (owner), Carol (admin), Eve (member)
 *   - 3 cards con labels, checklists, members, descriptions
 *   - Pending invitation: Dave
 *
 * Usuario compartido: Carol (en ambos boards, nunca owner)
 * Owner siempre tiene todos los permisos en true en la DB.
 *
 * Uso: node scripts/seed-dev.mjs
 * Opcional: RESET=1 para borrar los boards antes de re-crearlos.
 */

const apiBaseUrl = "http://localhost:3000/api/v1";
/* const apiBaseUrl =
  process.env.API_BASE ?? "https://kanban-server-zpq5.onrender.com/api/v1"; */
const shouldReset = process.env.RESET === "1";

const ALL_PERMISSIONS = [
  "create_stage",
  "create_card",
  "modify_card",
  "delete_card",
  "invite_member",
];

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
      "content-type": "application/json",
      origin: "http://localhost:5173",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const rawText = await response.text();
  const parsedBody = rawText ? safeJsonParse(rawText) : null;
  if (expect && response.status !== expect) {
    throw new Error(
      `${method} ${path} respondio ${response.status}\n${rawText}`,
    );
  }
  return { status: response.status, data: parsedBody };
}

async function ensureUser({ email, name, password }) {
  const registerResponse = await httpRequest("POST", "/auth/register", {
    body: { email, name, password },
  });
  if (registerResponse.status === 201 || registerResponse.status === 200) {
    return {
      user: registerResponse.data.user,
      token: registerResponse.data.accessToken,
    };
  }
  const loginResponse = await httpRequest("POST", "/auth/login", {
    body: { email, password },
    expect: 200,
  });
  return {
    user: loginResponse.data.user,
    token: loginResponse.data.accessToken,
  };
}

const seedUsers = [
  {
    email: "alice@kanban.dev",
    name: "Alice Martin",
    password: "Passw0rd!",
    role: "Tech Lead",
  },
  {
    email: "bob@kanban.dev",
    name: "Bob Navarro",
    password: "Passw0rd!",
    role: "Frontend Dev",
  },
  {
    email: "carol@kanban.dev",
    name: "Carol Rodriguez",
    password: "Passw0rd!",
    role: "UX Designer",
  },
  {
    email: "dave@kanban.dev",
    name: "Dave Wilson",
    password: "Passw0rd!",
    role: "Backend Dev",
  },
  {
    email: "eve@kanban.dev",
    name: "Eve Chen",
    password: "Passw0rd!",
    role: "Mobile Dev",
  },
];

// Labels para boards
const board1Labels = [
  { name: "Accessibility", color: "#9333ea" },
  { name: "UI/UX", color: "#3b82f6" },
  { name: "Refactor", color: "#f59e0b" },
  { name: "Bug", color: "#ef4444" },
];

const board2Labels = [
  { name: "Mobile", color: "#10b981" },
  { name: "API", color: "#8b5cf6" },
  { name: "Design", color: "#ec4899" },
];

const stageNames = ["Backlog", "In Progress", "Review", "Done"];

// Cards para Board 1 (Frontend Redesign) - 6 cards
const board1CardPlan = [
  // Backlog (stage 0)
  {
    stageIndex: 0,
    title: "Auditoria de accesibilidad (WCAG 2.1 AA)",
    description:
      "Revisar contraste, navegacion por teclado y roles ARIA en todas las vistas principales.",
    ownerEmail: "alice@kanban.dev",
    assigneeEmails: ["carol@kanban.dev"],
    labelNames: ["Accessibility"],
    checklist: [
      { text: "Revisar contraste de colores", done: false },
      { text: "Probar navegacion por teclado", done: false },
      { text: "Agregar roles ARIA faltantes", done: true },
    ],
  },
  {
    stageIndex: 0,
    title: "Migrar iconografia a Phosphor Icons",
    description:
      "Reemplazar lucide-react por @phosphor-icons/react y normalizar tamaños.",
    ownerEmail: "bob@kanban.dev",
    assigneeEmails: ["bob@kanban.dev"],
    labelNames: ["Refactor"],
    checklist: [
      { text: "Instalar @phosphor-icons/react", done: true },
      { text: "Reemplazar imports en componentes", done: false },
    ],
  },
  {
    stageIndex: 0,
    title: "Definir design tokens en Tailwind v4",
    description:
      "Colores, tipografia, radios y sombras centralizados; documentar en docs/FRONTEND.md.",
    ownerEmail: "alice@kanban.dev",
    assigneeEmails: ["carol@kanban.dev"],
    labelNames: ["UI/UX"],
    checklist: [],
  },
  // In Progress (stage 1)
  {
    stageIndex: 1,
    title: "Drag and drop entre etapas con @dnd-kit",
    description:
      "Reescritura del kanban board para soportar reordenado y cross-stage move con persistencia optimista.",
    ownerEmail: "bob@kanban.dev",
    assigneeEmails: ["bob@kanban.dev", "dave@kanban.dev"],
    labelNames: ["Refactor"],
    checklist: [
      { text: "Instalar @dnd-kit", done: true },
      { text: "Implementar DragOverlay", done: true },
      { text: "Persistir cambios en backend", done: false },
    ],
  },
  {
    stageIndex: 1,
    title: "Modal de detalle de tarjeta",
    description:
      "Labels, checklist, adjuntos y comentarios editables. Estado derivado del store central.",
    ownerEmail: "bob@kanban.dev",
    assigneeEmails: ["carol@kanban.dev"],
    labelNames: ["UI/UX"],
    checklist: [
      { text: "Componente base del modal", done: true },
      { text: "Seccion de checklist", done: true },
      { text: "Seccion de comentarios", done: false },
    ],
  },
  // Review (stage 2)
  {
    stageIndex: 2,
    title: "Integrar autenticacion JWT",
    description:
      "Capa services/api.ts con interceptor y refresh. Sustituir el mock de localStorage.",
    ownerEmail: "alice@kanban.dev",
    assigneeEmails: ["alice@kanban.dev", "dave@kanban.dev"],
    labelNames: ["Bug"],
    checklist: [
      { text: "Implementar refresh token", done: true },
      { text: "Manejo de errores 401", done: true },
      { text: "Tests de integracion", done: false },
    ],
  },
];

// Cards para Board 2 (Mobile App MVP) - 3 cards
const board2CardPlan = [
  // Backlog (stage 0)
  {
    stageIndex: 0,
    title: "Setup inicial React Native + Expo",
    description:
      "Scaffolding del proyecto mobile con navegacion y tema oscuro.",
    ownerEmail: "bob@kanban.dev",
    assigneeEmails: ["eve@kanban.dev"],
    labelNames: ["Mobile"],
    checklist: [
      { text: "Init Expo project", done: true },
      { text: "Configurar React Navigation", done: false },
    ],
  },
  // In Progress (stage 1)
  {
    stageIndex: 1,
    title: "API de autenticacion mobile",
    description:
      "Endpoints de login/logout con JWT para la app mobile. Integrar biometric auth.",
    ownerEmail: "bob@kanban.dev",
    assigneeEmails: ["eve@kanban.dev", "carol@kanban.dev"],
    labelNames: ["API", "Mobile"],
    checklist: [
      { text: "Endpoint de login", done: true },
      { text: "Implementar biometric auth", done: false },
    ],
  },
  // Review (stage 2)
  {
    stageIndex: 2,
    title: "Diseno de componentes base",
    description:
      "Button, Input, Card, Modal y Typography para la app mobile siguiendo design system.",
    ownerEmail: "carol@kanban.dev",
    assigneeEmails: ["carol@kanban.dev"],
    labelNames: ["Design", "Mobile"],
    checklist: [
      { text: "Button component", done: true },
      { text: "Input component", done: true },
      { text: "Card component", done: true },
      { text: "Modal component", done: false },
    ],
  },
];

async function main() {
  console.log(`Seeder dev - ${apiBaseUrl}\n`);

  // 1. Crear o login de los 5 usuarios
  const accounts = [];
  for (const seedUser of seedUsers) {
    const account = await ensureUser(seedUser);
    accounts.push({ ...seedUser, ...account });
    console.log(
      `${seedUser.name.padEnd(22)} ${seedUser.email}  id=${account.user.id.slice(0, 8)}`,
    );
  }

  const [aliceAccount, bobAccount, carolAccount, daveAccount, eveAccount] =
    accounts;

  // 2. Reset opcional
  if (shouldReset) {
    for (const account of [aliceAccount, bobAccount]) {
      const { data: existingBoards } = await httpRequest("GET", "/boards", {
        token: account.token,
      });
      for (const existingBoard of existingBoards ?? []) {
        if (existingBoard.ownerId === account.user.id) {
          await httpRequest("DELETE", `/boards/${existingBoard.id}`, {
            token: account.token,
            expect: 204,
          });
          console.log(
            `[reset] board borrado (${existingBoard.id.slice(0, 8)})`,
          );
        }
      }
    }
  }

  // 3. Alice crea Board 1: "Frontend Redesign"
  const { data: board1 } = await httpRequest("POST", "/boards", {
    token: aliceAccount.token,
    body: {
      name: "Frontend Redesign Q2",
      background: "bg-gradient-to-br from-indigo-500 to-violet-700",
    },
  });
  console.log(`\nBoard 1: "${board1.name}" id=${board1.id}`);
  console.log(`Owner: ${aliceAccount.name} (all permissions by default)\n`);

  // 4. Bob crea Board 2: "Mobile App MVP"
  const { data: board2 } = await httpRequest("POST", "/boards", {
    token: bobAccount.token,
    body: {
      name: "Mobile App MVP",
      background: "bg-gradient-to-br from-emerald-500 to-teal-700",
    },
  });
  console.log(`Board 2: "${board2.name}" id=${board2.id}`);
  console.log(`Owner: ${bobAccount.name} (all permissions by default)\n`);

  // 5. Invitar miembros a Board 1 (Alice ya es owner por defecto)
  const board1Invitations = [
    { account: bobAccount, role: "admin" },
    { account: carolAccount, role: "member" },
    { account: daveAccount, role: "member" },
  ];
  for (const inv of board1Invitations) {
    const { data: createdInv } = await httpRequest(
      "POST",
      `/boards/${board1.id}/invitations`,
      {
        token: aliceAccount.token,
        body: { email: inv.account.email, role: inv.role },
      },
    );
    await httpRequest("POST", `/invitations/${createdInv.token}/accept`, {
      token: inv.account.token,
      expect: 200,
    });
    console.log(`  ${inv.account.name} acepto invitacion (${inv.role})`);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  // 6. Invitar miembros a Board 2 (Bob ya es owner por defecto)
  const board2Invitations = [
    { account: carolAccount, role: "admin" },
    { account: eveAccount, role: "member" },
  ];
  for (const inv of board2Invitations) {
    const { data: createdInv } = await httpRequest(
      "POST",
      `/boards/${board2.id}/invitations`,
      {
        token: bobAccount.token,
        body: { email: inv.account.email, role: inv.role },
      },
    );
    await httpRequest("POST", `/invitations/${createdInv.token}/accept`, {
      token: inv.account.token,
      expect: 200,
    });
    console.log(`  ${inv.account.name} acepto invitacion (${inv.role})`);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  // 7. Crear invitaciones pendientes (no aceptadas)
  console.log("\nInvitaciones pendientes:");

  // Board 1: invitar a Eve (pendiente)
  await httpRequest("POST", `/boards/${board1.id}/invitations`, {
    token: aliceAccount.token,
    body: { email: eveAccount.email, role: "member" },
  });
  console.log(`  Board 1: ${eveAccount.name} (pendiente)`);

  // Board 2: invitar a Dave (pendiente)
  await httpRequest("POST", `/boards/${board2.id}/invitations`, {
    token: bobAccount.token,
    body: { email: daveAccount.email, role: "member" },
  });
  console.log(`  Board 2: ${daveAccount.name} (pendiente)\n`);

  // 8. Crear labels para Board 1
  const board1LabelIds = {};
  for (const label of board1Labels) {
    const { data: createdLabel } = await httpRequest(
      "POST",
      `/boards/${board1.id}/labels`,
      {
        token: aliceAccount.token,
        body: label,
      },
    );
    board1LabelIds[label.name] = createdLabel.id;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  console.log(`Labels Board 1: ${board1Labels.map((l) => l.name).join(", ")}`);

  // 9. Crear labels para Board 2
  const board2LabelIds = {};
  for (const label of board2Labels) {
    const { data: createdLabel } = await httpRequest(
      "POST",
      `/boards/${board2.id}/labels`,
      {
        token: bobAccount.token,
        body: label,
      },
    );
    board2LabelIds[label.name] = createdLabel.id;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  console.log(
    `Labels Board 2: ${board2Labels.map((l) => l.name).join(", ")}\n`,
  );

  // 10. Crear stages para Board 1
  const board1StageIds = [];
  for (const stageName of stageNames) {
    const { data: createdStage } = await httpRequest(
      "POST",
      `/boards/${board1.id}/stages`,
      {
        token: aliceAccount.token,
        body: { name: stageName },
      },
    );
    board1StageIds.push(createdStage.id);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  console.log(`Stages Board 1: ${stageNames.join(", ")}`);

  // 11. Crear stages para Board 2
  const board2StageIds = [];
  for (const stageName of stageNames) {
    const { data: createdStage } = await httpRequest(
      "POST",
      `/boards/${board2.id}/stages`,
      {
        token: bobAccount.token,
        body: { name: stageName },
      },
    );
    board2StageIds.push(createdStage.id);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  console.log(`Stages Board 2: ${stageNames.join(", ")}\n`);

  // 12. Funcion helper para obtener ID de usuario por email
  function getUserIdByEmail(email) {
    const account = accounts.find((a) => a.email === email);
    return account ? account.user.id : null;
  }

  // 13. Crear cards para Board 1
  console.log("Cards Board 1:");
  for (const plannedCard of board1CardPlan) {
    const authorEmail = plannedCard.ownerEmail;
    const author = accounts.find((a) => a.email === authorEmail);
    if (!author) continue;

    const { data: createdCard } = await httpRequest(
      "POST",
      `/stages/${board1StageIds[plannedCard.stageIndex]}/cards`,
      {
        token: author.token,
        body: {
          title: plannedCard.title,
          description: plannedCard.description,
        },
      },
    );

    // Agregar labels
    if (plannedCard.labelNames) {
      for (const labelName of plannedCard.labelNames) {
        const labelId = board1LabelIds[labelName];
        if (labelId) {
          await httpRequest(
            "POST",
            `/cards/${createdCard.id}/labels/${labelId}`,
            { token: author.token },
          );
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }
    }

    // Agregar members (assignees)
    if (plannedCard.assigneeEmails) {
      for (const assigneeEmail of plannedCard.assigneeEmails) {
        const userId = getUserIdByEmail(assigneeEmail);
        if (userId) {
          await httpRequest("POST", `/cards/${createdCard.id}/members`, {
            token: author.token,
            body: { userId },
          });
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }
    }

    // Agregar checklist items
    if (plannedCard.checklist && plannedCard.checklist.length > 0) {
      for (const item of plannedCard.checklist) {
        await httpRequest("POST", `/cards/${createdCard.id}/checklist`, {
          token: author.token,
          body: { text: item.text, done: item.done },
        });
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
    }

    console.log(
      `  [${stageNames[plannedCard.stageIndex].padEnd(13)}] ${plannedCard.title}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  // 14. Crear cards para Board 2
  console.log("\nCards Board 2:");
  for (const plannedCard of board2CardPlan) {
    const authorEmail = plannedCard.ownerEmail;
    const author = accounts.find((a) => a.email === authorEmail);
    if (!author) continue;

    const { data: createdCard } = await httpRequest(
      "POST",
      `/stages/${board2StageIds[plannedCard.stageIndex]}/cards`,
      {
        token: author.token,
        body: {
          title: plannedCard.title,
          description: plannedCard.description,
        },
      },
    );

    // Agregar labels
    if (plannedCard.labelNames) {
      for (const labelName of plannedCard.labelNames) {
        const labelId = board2LabelIds[labelName];
        if (labelId) {
          await httpRequest(
            "POST",
            `/cards/${createdCard.id}/labels/${labelId}`,
            { token: author.token },
          );
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }
    }

    // Agregar members (assignees)
    if (plannedCard.assigneeEmails) {
      for (const assigneeEmail of plannedCard.assigneeEmails) {
        const userId = getUserIdByEmail(assigneeEmail);
        if (userId) {
          await httpRequest("POST", `/cards/${createdCard.id}/members`, {
            token: author.token,
            body: { userId },
          });
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }
    }

    // Agregar checklist items
    if (plannedCard.checklist && plannedCard.checklist.length > 0) {
      for (const item of plannedCard.checklist) {
        await httpRequest("POST", `/cards/${createdCard.id}/checklist`, {
          token: author.token,
          body: { text: item.text, done: item.done },
        });
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
    }

    console.log(
      `  [${stageNames[plannedCard.stageIndex].padEnd(13)}] ${plannedCard.title}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  console.log("\nSeed completo!");
  console.log(`\nLogin con alice@kanban.dev / Passw0rd! (owner de Board 1)`);
  console.log(`Login con bob@kanban.dev / Passw0rd! (owner de Board 2)`);
  console.log(
    `Carol esta en ambos boards (member en Board 1, admin en Board 2)`,
  );
  console.log(`Dave solo en Board 1 (member), Eve solo en Board 2 (member)`);
  console.log(`\nInvitaciones pendientes:`);
  console.log(`  - Eve invitada a Board 1 (aceptar en /invitations)`);
  console.log(`  - Dave invitado a Board 2 (aceptar en /invitations)`);
}

main().catch((error) => {
  console.error("\n", error.message);
  process.exit(1);
});
