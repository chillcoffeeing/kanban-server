import { addDays } from "date-fns";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { config } from "dotenv";
import * as crypto from "crypto";

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ALL_PERMISSIONS = [
  "create_stage",
  "create_card",
  "modify_card",
  "delete_card",
  "invite_member",
];

type SeedUser = { email: string; name: string; role: string; username: string };

async function main() {
  console.log("🌱 Starting comprehensive seed...\n");

  // Cleanup existing data (reverse order of dependencies)
  console.log("🧹 Cleaning up existing data...");
  await prisma.comment.deleteMany({});
  await prisma.cardMember.deleteMany({});
  await prisma.cardLabel.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.stage.deleteMany({});
  await prisma.boardPreference.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.boardMembership.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("  ✓ Database cleaned");

  // 1. Create users
  console.log("📝 Creating users...");
  const seedUsers: SeedUser[] = [
    {
      email: "alice@kanban.dev",
      name: "Alice Martin",
      role: "Tech Lead",
      username: "alice_m",
    },
    {
      email: "bob@kanban.dev",
      name: "Bob Navarro",
      role: "Frontend Dev",
      username: "bob_n",
    },
    {
      email: "carol@kanban.dev",
      name: "Carol Rodriguez",
      role: "UX Designer",
      username: "carol_r",
    },
    {
      email: "dave@kanban.dev",
      name: "Dave Wilson",
      role: "Backend Dev",
      username: "dave_w",
    },
    {
      email: "eve@kanban.dev",
      name: "Eve Chen",
      role: "Mobile Dev",
      username: "eve_c",
    },
    {
      email: "frank@kanban.dev",
      name: "Frank Thompson",
      role: "DevOps Engineer",
      username: "frank_t",
    },
    {
      email: "grace@kanban.dev",
      name: "Grace Kim",
      role: "Data Engineer",
      username: "grace_k",
    },
  ];

  const users: {
    id: string;
    email: string;
    name: string;
    role: string;
    username: string;
  }[] = [];
  for (const seedUser of seedUsers) {
    const user = await prisma.user.create({
      data: {
        email: seedUser.email,
        name: seedUser.name,
        username: seedUser.username,
        passwordHash: await bcrypt.hash(
          "Passw0rd!",
          process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS) : 10,
        ),
        avatarUrl: `https://i.pravatar.cc/150?u=${seedUser.email}`,
      },
    });
    users.push({ ...seedUser, id: user.id });
    console.log(`  ✓ ${user.name} (${user.email})`);
  }

  // 2. Create profiles and preferences for users
  console.log("\n📋 Creating profiles and preferences...");
  const profileData = [
    {
      userId: users[0].id,
      profile: {
        displayName: "Alice Martin",
        bio: "Tech Lead con 8+ años de experiencia en arquitectura de software y liderazgo de equipos ágiles.",
        jobTitle: "Tech Lead",
        company: "KanbanFlow Inc.",
        location: "Madrid, España",
        coverUrl: "https://images.unsplash.com/photo-1553879582-76a8c5b25c18?w=1200",
        socialWebsite: "https://alicemartin.dev",
        socialTwitter: "@alice_martin",
        socialGithub: "alice-martin",
        socialLinkedin: "alice-martin-tech",
        socialInstagram: "alice.codes",
      },
    },
    {
      userId: users[1].id,
      profile: {
        displayName: "Bob Navarro",
        bio: "Frontend Developer apasionado por React, TypeScript y crear interfaces de usuario excepcionales.",
        jobTitle: "Frontend Dev",
        company: "KanbanFlow Inc.",
        location: "Barcelona, España",
        coverUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200",
        socialWebsite: "https://bobnavarro.dev",
        socialGithub: "bob-navarro",
        socialLinkedin: "bob-navarro-dev",
        socialTwitter: "@bob_n_codes",
      },
    },
    {
      userId: users[2].id,
      profile: {
        displayName: "Carol Rodriguez",
        bio: "UX Designer enfocada en experiencias de usuario accesibles y design systems escalables.",
        jobTitle: "UX Designer",
        company: "KanbanFlow Inc.",
        location: "Valencia, España",
        coverUrl: "https://images.unsplash.com/photo-1561070791-2529016b179a7?w=1200",
        socialWebsite: "https://carolrodriguez.design",
        socialGithub: "carol-rodriguez",
        socialLinkedin: "carol-rodriguez-ux",
        socialInstagram: "carol.designs",
      },
    },
    {
      userId: users[3].id,
      profile: {
        displayName: "Dave Wilson",
        bio: "Backend Developer especializado en APIs RESTful, microservicios y bases de datos PostgreSQL.",
        jobTitle: "Backend Dev",
        company: "KanbanFlow Inc.",
        location: "Sevilla, España",
        coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
        socialWebsite: "https://davewilson.tech",
        socialGithub: "dave-wilson",
        socialLinkedin: "dave-wilson-backend",
      },
    },
    {
      userId: users[4].id,
      profile: {
        displayName: "Eve Chen",
        bio: "Mobile Developer creando apps multiplataforma con React Native y Expo. Amo el diseño mobile-first.",
        jobTitle: "Mobile Dev",
        company: "KanbanFlow Inc.",
        location: "Bilbao, España",
        coverUrl: "https://images.unsplash.com/photo-1512486130939-2c5c9ed22d41?w=1200",
        socialWebsite: "https://evechen.dev",
        socialGithub: "eve-chen",
        socialLinkedin: "eve-chen-mobile",
        socialTwitter: "@eve_c_mobile",
      },
    },
    {
      userId: users[5].id,
      profile: {
        displayName: "Frank Thompson",
        bio: "DevOps Engineer experto en CI/CD, infraestructura cloud y Docker. Automatizando todo lo que se deja.",
        jobTitle: "DevOps Engineer",
        company: "KanbanFlow Inc.",
        location: "Austin, USA",
        coverUrl: "https://images.unsplash.com/photo-1531746790095-e5cb157c0c86?w=1200",
        socialWebsite: "https://frankthompson.dev",
        socialGithub: "frank-thompson",
        socialLinkedin: "frank-thompson-devops",
        socialTwitter: "@frank_devops",
      },
    },
    {
      userId: users[6].id,
      profile: {
        displayName: "Grace Kim",
        bio: "Data Engineer construyendo pipelines de datos escalables con Python, Spark y PostgreSQL.",
        jobTitle: "Data Engineer",
        company: "KanbanFlow Inc.",
        location: "Seúl, Corea del Sur",
        coverUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1200",
        socialWebsite: "https://gracekim.dev",
        socialGithub: "grace-kim",
        socialLinkedin: "grace-kim-data",
        socialInstagram: "grace.codes",
      },
    },
  ];

  for (const entry of profileData) {
    await prisma.userProfile.create({ data: entry });
  }

  for (const createdUser of users) {
    await prisma.userPreference.create({
      data: {
        userId: createdUser.id,
        settings: {
          theme: "light",
          language: "es",
          dateFormat: "DMY",
          timeFormat: "24h",
        },
      },
    });
  }
  console.log("  ✓ Profiles and preferences created");

  const [alice, bob, carol, dave, eve, frank, grace] = users;

  // 3. Board 1: "Frontend Redesign Q2"
  console.log('\n📋 Creating Board 1: "Frontend Redesign Q2"...');
  const board1 = await prisma.board.create({
    data: {
      name: "Frontend Redesign Q2",
      background: "bg-gradient-to-br from-indigo-500 to-violet-700",
    },
  });
  console.log(`  ✓ ${board1.name}`);

  // Create board preference for board 1
  await prisma.boardPreference.create({
    data: {
      boardId: board1.id,
      settings: {
        showMembers: true,
        showLabels: true,
        cardCover: false,
      },
    },
  });

  // 4. Board 2: "Mobile App MVP"
  console.log('\n📋 Creating Board 2: "Mobile App MVP"...');
  const board2 = await prisma.board.create({
    data: {
      name: "Mobile App MVP",
      background: "bg-gradient-to-br from-emerald-500 to-teal-700",
    },
  });
  console.log(`  ✓ ${board2.name}`);

  // Create board preference for board 2
  await prisma.boardPreference.create({
    data: {
      boardId: board2.id,
      settings: {
        showMembers: true,
        showLabels: true,
        cardCover: false,
      },
    },
  });

  // 4.5 Board 3: "Data Pipeline"
  console.log('\n📋 Creating Board 3: "Data Pipeline"...');
  const board3 = await prisma.board.create({
    data: {
      name: "Data Pipeline",
      background: "bg-gradient-to-br from-orange-500 to-red-700",
    },
  });
  console.log(`  ✓ ${board3.name}`);

  // Create board preference for board 3
  await prisma.boardPreference.create({
    data: {
      boardId: board3.id,
      settings: {
        showMembers: true,
        showLabels: true,
        cardCover: true,
      },
    },
  });

  // 4. Board 1 memberships
  console.log("\n👥 Board 1 memberships...");
  const b1Memberships = [
    { userId: alice.id, role: "owner" as const, perms: ALL_PERMISSIONS },
    { userId: bob.id, role: "member" as const, perms: [] },
    { userId: carol.id, role: "member" as const, perms: [] },
    { userId: dave.id, role: "member" as const, perms: [] },
  ];
  const b1MemMap = new Map();
  for (const membership of b1Memberships) {
    const created = await prisma.boardMembership.create({
      data: {
        boardId: board1.id,
        userId: membership.userId,
        role: membership.role,
        permissions: membership.perms,
      },
    });
    b1MemMap.set(membership.userId, created);
    console.log(
      `  ✓ ${users.find((user) => user.id === membership.userId)?.name} (${membership.role})`,
    );
  }

  // 5. Board 2 memberships
  console.log("\n👥 Board 2 memberships...");
  const b2Memberships = [
    { userId: bob.id, role: "owner" as const, perms: ALL_PERMISSIONS },
    { userId: carol.id, role: "member" as const, perms: [] },
    { userId: eve.id, role: "member" as const, perms: [] },
  ];
  const b2MemMap = new Map();
  for (const membership of b2Memberships) {
    const created = await prisma.boardMembership.create({
      data: {
        boardId: board2.id,
        userId: membership.userId,
        role: membership.role,
        permissions: membership.perms,
      },
    });
    b2MemMap.set(membership.userId, created);
    console.log(
      `  ✓ ${users.find((user) => user.id === membership.userId)?.name} (${membership.role})`,
    );
  }

  // 5.5 Board 3 memberships
  console.log("\n👥 Board 3 memberships...");
  const b3Memberships = [
    { userId: eve.id, role: "owner" as const, perms: ALL_PERMISSIONS },
    { userId: dave.id, role: "member" as const, perms: [] },
    { userId: grace.id, role: "member" as const, perms: [] },
    { userId: frank.id, role: "member" as const, perms: [] },
  ];
  const b3MemMap = new Map();
  for (const membership of b3Memberships) {
    const created = await prisma.boardMembership.create({
      data: {
        boardId: board3.id,
        userId: membership.userId,
        role: membership.role,
        permissions: membership.perms,
      },
    });
    b3MemMap.set(membership.userId, created);
    console.log(
      `  ✓ ${users.find((user) => user.id === membership.userId)?.name} (${membership.role})`,
    );
  }

  // 6. Pending invitations
  console.log("\n📨 Pending invitations...");
  const tokenExpires = addDays(new Date(), 7);
  await prisma.invitation.create({
    data: {
      boardId: board1.id,
      email: eve.email,
      role: "member",
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: tokenExpires,
    },
  });
  console.log(`  ✓ Board 1: ${eve.name} (pending)`);
  await prisma.invitation.create({
    data: {
      boardId: board2.id,
      email: dave.email,
      role: "member",
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: tokenExpires,
    },
  });
  console.log(`  ✓ Board 2: ${dave.name} (pending)`);
  await prisma.invitation.create({
    data: {
      boardId: board3.id,
      email: alice.email,
      role: "member",
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: tokenExpires,
    },
  });
  console.log(`  ✓ Board 3: ${alice.name} (pending)`);

  // 7. Labels Board 1
  console.log("\n🏷️  Labels for Board 1...");
  const b1Labels = [
    { name: "Accessibility", color: "#9333ea" },
    { name: "UI/UX", color: "#3b82f6" },
    { name: "Refactor", color: "#f59e0b" },
    { name: "Bug", color: "#ef4444" },
  ];
  const b1LabelMap = new Map();
  for (const labelData of b1Labels) {
    const label = await prisma.label.create({
      data: { boardId: board1.id, name: labelData.name, color: labelData.color },
    });
    b1LabelMap.set(labelData.name, label);
    console.log(`  ✓ ${labelData.name}`);
  }

  // 8. Labels Board 2
  console.log("\n🏷️  Labels for Board 2...");
  const b2Labels = [
    { name: "Mobile", color: "#10b981" },
    { name: "API", color: "#8b5cf6" },
    { name: "Design", color: "#ec4899" },
  ];
  const b2LabelMap = new Map();
  for (const labelData of b2Labels) {
    const label = await prisma.label.create({
      data: { boardId: board2.id, name: labelData.name, color: labelData.color },
    });
    b2LabelMap.set(labelData.name, label);
    console.log(`  ✓ ${labelData.name}`);
  }

  // 8.5 Labels Board 3
  console.log("\n🏷️  Labels for Board 3...");
  const b3Labels = [
    { name: "Backend", color: "#f59e0b" },
    { name: "Data", color: "#3b82f6" },
    { name: "Infra", color: "#ef4444" },
    { name: "Monitoring", color: "#10b981" },
  ];
  const b3LabelMap = new Map();
  for (const labelData of b3Labels) {
    const label = await prisma.label.create({
      data: { boardId: board3.id, name: labelData.name, color: labelData.color },
    });
    b3LabelMap.set(labelData.name, label);
    console.log(`  ✓ ${labelData.name}`);
  }

  // 9. Stages Board 1
  console.log("\n📊 Stages for Board 1...");
  const stageNames = ["Planning", "Backlog", "In Progress", "Review", "Done", "Deployed"];
  const b1Stages = [];
  for (let i = 0; i < stageNames.length; i++) {
    const stage = await prisma.stage.create({
      data: { boardId: board1.id, name: stageNames[i], position: i + 1 },
    });
    b1Stages.push(stage);
    console.log(`  ✓ ${stage.name}`);
  }

  // 10. Stages Board 2
  console.log("\n📊 Stages for Board 2...");
  const b2Stages = [];
  for (let i = 0; i < stageNames.length; i++) {
    const stage = await prisma.stage.create({
      data: { boardId: board2.id, name: stageNames[i], position: i + 1 },
    });
    b2Stages.push(stage);
    console.log(`  ✓ ${stage.name}`);
  }

  // 10.5 Stages Board 3
  console.log("\n📊 Stages for Board 3...");
  const b3Stages = [];
  for (let i = 0; i < stageNames.length; i++) {
    const stage = await prisma.stage.create({
      data: { boardId: board3.id, name: stageNames[i], position: i + 1 },
    });
    b3Stages.push(stage);
    console.log(`  ✓ ${stage.name}`);
  }

  // Helper to create cards — returns map of title → card for ID lookups
  async function createCards(
    boardStages: any,
    boardLabels: any,
    boardMemMap: any,
    cardsPlan: any,
    boardNum: any,
  ): Promise<Map<string, { id: string; title: string }>> {
    console.log(`\n📝 Cards for Board ${boardNum}...`);
    const cardMap = new Map<string, { id: string; title: string }>();
    let position = 1;
    for (const cardPlan of cardsPlan) {
      const stage = boardStages[cardPlan.stageIndex];
      const card = await prisma.card.create({
        data: {
          stageId: stage.id,
          title: cardPlan.title,
          description: cardPlan.description,
          position: position++,
        },
      });
      cardMap.set(cardPlan.title, { id: card.id, title: card.title });

      // Labels
      if (cardPlan.labelNames) {
        for (const labelName of cardPlan.labelNames) {
          const label = boardLabels.get(labelName);
          if (label)
            await prisma.cardLabel.create({
              data: { cardId: card.id, labelId: label.id },
            });
        }
      }

      // Members via boardMembershipId
      if (cardPlan.assigneeEmails) {
        for (const email of cardPlan.assigneeEmails) {
          const user = users.find((createdUser) => createdUser.email === email);
          if (user) {
            const membership = boardMemMap.get(user.id);
            if (membership)
              await prisma.cardMember.create({
                data: { cardId: card.id, boardMembershipId: membership.id },
              });
          }
        }
      }

      // Checklist
      if (cardPlan.checklist) {
        for (let itemIndex = 0; itemIndex < cardPlan.checklist.length; itemIndex++) {
          await prisma.checklistItem.create({
            data: {
              cardId: card.id,
              text: cardPlan.checklist[itemIndex].text,
              done: cardPlan.checklist[itemIndex].done,
              position: itemIndex + 1,
            },
          });
        }
      }

      console.log(`  ✓ [${stage.name}] ${card.title}`);
    }
    return cardMap;
  }

  function findCardId(cardMap: Map<string, { id: string; title: string }>, hint: string): string {
    const exact = [...cardMap.values()].find((c) => c.title === hint);
    if (exact) return exact.id;
    const partial = [...cardMap.values()].find((c) => c.title.startsWith(hint));
    return partial?.id ?? crypto.randomUUID();
  }

  // Board 1 cards
  const b1CardMap = await createCards(
    b1Stages,
    b1LabelMap,
    b1MemMap,
    [
      {
        stageIndex: 0,
        title: "Planificar sprint de rediseno",
        description:
          "Definir alcance, milestones y recursos necesarios para el frontend redesign Q2.",
        assigneeEmails: [alice.email, bob.email],
        labelNames: ["UI/UX"],
        checklist: [
          { text: "Definir milestones", done: true },
          { text: "Asignar recursos", done: true },
        ],
      },
      {
        stageIndex: 0,
        title: "Research de tendencias UI 2026",
        description:
          "Recopilar referencias de diseno moderno para inspirar el rediseno.",
        assigneeEmails: [carol.email],
        labelNames: ["UI/UX"],
        checklist: [
          { text: "Crear moodboard", done: true },
          { text: "Seleccionar paleta", done: false },
        ],
      },
      {
        stageIndex: 0,
        title: "Auditoria de accesibilidad (WCAG 2.1 AA)",
        description:
          "Revisar contraste, navegacion por teclado y roles ARIA en todas las vistas principales.",
        assigneeEmails: [carol.email],
        labelNames: ["Accessibility"],
        checklist: [
          { text: "Revisar contraste de colores", done: false },
          { text: "Probar navegacion por teclado", done: false },
          { text: "Agregar roles ARIA faltantes", done: true },
        ],
      },
      {
        stageIndex: 1,
        title: "Migrar iconografia a Phosphor Icons",
        description:
          "Reemplazar lucide-react por @phosphor-icons/react y normalizar tamaños.",
        assigneeEmails: [bob.email],
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
        assigneeEmails: [carol.email],
        labelNames: ["UI/UX"],
        checklist: [],
      },
      {
        stageIndex: 1,
        title: "Drag and drop entre etapas con @dnd-kit",
        description:
          "Reescritura del kanban board para soportar reordenado y cross-stage move con persistencia optimista.",
        assigneeEmails: [bob.email, dave.email],
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
        assigneeEmails: [carol.email],
        labelNames: ["UI/UX"],
        checklist: [
          { text: "Componente base del modal", done: true },
          { text: "Seccion de checklist", done: true },
          { text: "Seccion de comentarios", done: false },
        ],
      },
      {
        stageIndex: 2,
        title: "Integrar autenticacion JWT",
        description:
          "Capa services/api.ts con interceptor y refresh. Sustituir el mock de localStorage.",
        assigneeEmails: [alice.email, dave.email],
        labelNames: ["Bug"],
        checklist: [
          { text: "Implementar refresh token", done: true },
          { text: "Manejo de errores 401", done: true },
          { text: "Tests de integracion", done: false },
        ],
      },
      {
        stageIndex: 3,
        title: "Test de regresion visual",
        description:
          "Configurar Chromatic o Percy para capturar diffs visuales en cada PR.",
        assigneeEmails: [carol.email, bob.email],
        labelNames: ["UI/UX"],
        checklist: [
          { text: "Investigar herramientas", done: true },
          { text: "Integrar en CI", done: false },
        ],
      },
      {
        stageIndex: 4,
        title: "Auditoria de rendimiento Lighthouse",
        description:
          "Alcanzar puntuacion minima de 90 en rendimiento, accesibilidad y SEO.",
        assigneeEmails: [bob.email, alice.email],
        labelNames: ["Accessibility"],
        checklist: [
          { text: "Ejecutar Lighthouse en cada vista", done: false },
          { text: "Optimizar LCP y CLS", done: false },
        ],
      },
    ],
    1,
  );

  // Board 2 cards
  const b2CardMap = await createCards(
    b2Stages,
    b2LabelMap,
    b2MemMap,
    [
      {
        stageIndex: 0,
        title: "Setup inicial React Native + Expo",
        description:
          "Scaffolding del proyecto mobile con navegacion y tema oscuro.",
        assigneeEmails: [eve.email],
        labelNames: ["Mobile"],
        checklist: [
          { text: "Init Expo project", done: true },
          { text: "Configurar React Navigation", done: false },
        ],
      },
      {
        stageIndex: 1,
        title: "API de autenticacion mobile",
        description:
          "Endpoints de login/logout con JWT para la app mobile. Integrar biometric auth.",
        assigneeEmails: [eve.email, carol.email],
        labelNames: ["API", "Mobile"],
        checklist: [
          { text: "Endpoint de login", done: true },
          { text: "Implementar biometric auth", done: false },
        ],
      },
      {
        stageIndex: 2,
        title: "Diseno de componentes base",
        description:
          "Button, Input, Card, Modal y Typography para la app mobile siguiendo design system.",
        assigneeEmails: [carol.email],
        labelNames: ["Design", "Mobile"],
        checklist: [
          { text: "Button component", done: true },
          { text: "Input component", done: true },
          { text: "Card component", done: true },
          { text: "Modal component", done: false },
        ],
      },
      {
        stageIndex: 3,
        title: "Revision de diseno UX mobile",
        description:
          "Evaluar flujos de navegacion y prototipar pantallas faltantes en Figma.",
        assigneeEmails: [carol.email, eve.email],
        labelNames: ["Design"],
        checklist: [
          { text: "Flujo de onboarding", done: true },
          { text: "Pantalla de configuracion", done: false },
        ],
      },
      {
        stageIndex: 3,
        title: "Pruebas de API en dispositivos moviles",
        description:
          "Verificar que los endpoints responden correctamente con ancho de banda limitado.",
        assigneeEmails: [eve.email],
        labelNames: ["API", "Mobile"],
        checklist: [
          { text: "Probar con throttling 3G", done: false },
          { text: "Cachear respuestas offline", done: false },
        ],
      },
      {
        stageIndex: 4,
        title: "Publicar beta en TestFlight",
        description:
          "Preparar build para distribucion interna y recolectar feedback temprano.",
        assigneeEmails: [eve.email, bob.email],
        labelNames: ["Mobile"],
        checklist: [
          { text: "Configurar certificados", done: true },
          { text: "Subir build a TestFlight", done: false },
        ],
      },
    ],
    2,
  );

  // Board 3 cards
  const b3CardMap = await createCards(
    b3Stages,
    b3LabelMap,
    b3MemMap,
    [
      {
        stageIndex: 0,
        title: "Disenar arquitectura del pipeline",
        description:
          "Definir el flujo de datos desde fuentes (APIs, DBs) hasta el data warehouse.",
        assigneeEmails: [grace.email, dave.email],
        labelNames: ["Data"],
        checklist: [
          { text: "Diagrama de arquitectura", done: true },
          { text: "Seleccionar herramientas", done: true },
        ],
      },
      {
        stageIndex: 1,
        title: "Implementar extraccion de datos",
        description:
          "Conectar fuentes externas (Stripe, Mixpanel) y normalizar datos crudos.",
        assigneeEmails: [grace.email],
        labelNames: ["Data", "Backend"],
        checklist: [
          { text: "Integracion con Stripe API", done: true },
          { text: "Integracion con Mixpanel", done: false },
        ],
      },
      {
        stageIndex: 3,
        title: "Configurar alertas de monitoreo",
        description:
          "Implementar sistema de alertas para fallos en el pipeline basado en Datadog.",
        assigneeEmails: [frank.email, grace.email],
        labelNames: ["Monitoring", "Infra"],
        checklist: [
          { text: "Dashboards en Datadog", done: false },
          { text: "Alertas por Slack", done: false },
        ],
      },
      {
        stageIndex: 5,
        title: "Desplegar worker de procesamiento",
        description:
          "Containerizar y desplegar workers en Kubernetes para proceso nocturno de datos.",
        assigneeEmails: [frank.email, eve.email],
        labelNames: ["Infra"],
        checklist: [
          { text: "Dockerizar worker", done: true },
          { text: "Configurar CronJob en K8s", done: false },
        ],
      },
    ],
    3,
  );

  // Comments
  console.log("\n💬 Adding comments...");
  const b1FirstCard = await prisma.card.findFirst({
    where: { stageId: b1Stages[0].id },
  });
  if (b1FirstCard) {
    await prisma.comment.createMany({
      data: [
        {
          cardId: b1FirstCard.id,
          authorId: b1MemMap.get(alice.id).id, // Use BoardMembership ID
          body: "Let's get this started! WCAG 2.1 AA compliance.",
        },
        {
          cardId: b1FirstCard.id,
          authorId: b1MemMap.get(carol.id).id, // Use BoardMembership ID
          body: "I'll help with the accessibility audit.",
        },
      ],
    });
  }
  const b2FirstCard = await prisma.card.findFirst({
    where: { stageId: b2Stages[0].id },
  });
  if (b2FirstCard) {
    await prisma.comment.createMany({
      data: [
        {
          cardId: b2FirstCard.id,
          authorId: b2MemMap.get(bob.id).id, // Use BoardMembership ID
          body: "Setting up Expo with TypeScript.",
        },
        {
          cardId: b2FirstCard.id,
          authorId: b2MemMap.get(eve.id).id, // Use BoardMembership ID
          body: "I'll handle navigation setup.",
        },
      ],
    });
  }
  const b3FirstCard = await prisma.card.findFirst({
    where: { stageId: b3Stages[0].id },
  });
  if (b3FirstCard) {
    await prisma.comment.createMany({
      data: [
        {
          cardId: b3FirstCard.id,
          authorId: b3MemMap.get(eve.id).id,
          body: "Great initiative! Let's align with the existing data strategy.",
        },
        {
          cardId: b3FirstCard.id,
          authorId: b3MemMap.get(grace.id).id,
          body: "I'll draft the architecture proposal this week.",
        },
      ],
    });
  }
  console.log("  ✓ Comments added");

  // Activities
  console.log("\n📋 Adding activity records...");

  async function addActivity(
    boardId: string,
    memMap: Map<string, { id: string }>,
    user: { id: string; name: string },
    type: string,
    detail: string,
    meta: Prisma.InputJsonValue,
    daysAgo: number,
  ) {
    const membership = memMap.get(user.id);
    if (!membership) return;
    await prisma.activity.create({
      data: {
        boardId,
        membershipId: membership.id,
        userName: user.name,
        type,
        detail,
        meta,
        createdAt: new Date(Date.now() - daysAgo * 86_400_000),
      },
    });
  }

  // Board 1 activities
  await addActivity(board1.id, b1MemMap, alice, "card_moved", `Movió "Auditoria de rendimiento Lighthouse" de "Review" a "Done"`, { cardId: findCardId(b1CardMap, "Auditoria de rendimiento Lighthouse"), fromStage: "Review", toStage: "Done" }, 0.1);
  await addActivity(board1.id, b1MemMap, bob, "card_checklist_toggled", `Completó "Implementar DragOverlay" en "Drag and drop entre etapas"`, { cardId: findCardId(b1CardMap, "Drag and drop entre etapas"), itemText: "Implementar DragOverlay", done: true }, 0.3);
  await addActivity(board1.id, b1MemMap, carol, "card_label_added", `Agregó etiqueta "Accessibility" a "Auditoria de accesibilidad"`, { cardId: findCardId(b1CardMap, "Auditoria de accesibilidad"), labelName: "Accessibility" }, 0.5);
  await addActivity(board1.id, b1MemMap, alice, "stage_created", `Creó la etapa "Deployed"`, { stageId: crypto.randomUUID() }, 1);
  await addActivity(board1.id, b1MemMap, dave, "card_created", `Creó la tarjeta "Integrar autenticacion JWT"`, { cardId: findCardId(b1CardMap, "Integrar autenticacion JWT"), stageId: crypto.randomUUID() }, 2);
  await addActivity(board1.id, b1MemMap, alice, "board_renamed", `Renombró el tablero "Frontend Q2" a "Frontend Redesign Q2"`, { oldName: "Frontend Q2", newName: "Frontend Redesign Q2" }, 3);
  await addActivity(board1.id, b1MemMap, carol, "member_invited", `Invitó a "Dave Wilson" al tablero`, { memberEmail: dave.email, memberName: dave.name }, 4);
  await addActivity(board1.id, b1MemMap, bob, "card_checklist_added", `Agregó "Instalar @dnd-kit" al checklist de "Drag and drop entre etapas"`, { cardId: findCardId(b1CardMap, "Drag and drop entre etapas"), itemText: "Instalar @dnd-kit" }, 5);

  // Board 2 activities
  await addActivity(board2.id, b2MemMap, eve, "card_created", `Creó la tarjeta "Setup inicial React Native + Expo"`, { cardId: findCardId(b2CardMap, "Setup inicial React Native + Expo"), stageId: crypto.randomUUID() }, 0.2);
  await addActivity(board2.id, b2MemMap, carol, "card_checklist_toggled", `Completó "Button component" en "Diseno de componentes base"`, { cardId: findCardId(b2CardMap, "Diseno de componentes base"), itemText: "Button component", done: true }, 0.4);
  await addActivity(board2.id, b2MemMap, bob, "card_moved", `Movió "Publicar beta en TestFlight" de "Backlog" a "Done"`, { cardId: findCardId(b2CardMap, "Publicar beta en TestFlight"), fromStage: "Backlog", toStage: "Done" }, 1);
  await addActivity(board2.id, b2MemMap, eve, "member_invited", `Invitó a "Carol Rodriguez" al tablero`, { memberEmail: carol.email, memberName: carol.name }, 2);
  await addActivity(board2.id, b2MemMap, bob, "card_checklist_added", `Agregó "Certificados iOS" al checklist de "Publicar beta en TestFlight"`, { cardId: findCardId(b2CardMap, "Publicar beta en TestFlight"), itemText: "Certificados iOS" }, 6);

  // Board 3 activities
  await addActivity(board3.id, b3MemMap, eve, "board_renamed", `Renombró el tablero "ETL Pipeline" a "Data Pipeline"`, { oldName: "ETL Pipeline", newName: "Data Pipeline" }, 0.5);
  await addActivity(board3.id, b3MemMap, grace, "card_created", `Creó la tarjeta "Disenar arquitectura del pipeline"`, { cardId: findCardId(b3CardMap, "Disenar arquitectura del pipeline"), stageId: crypto.randomUUID() }, 1);
  await addActivity(board3.id, b3MemMap, frank, "card_label_added", `Agregó etiqueta "Infra" a "Desplegar worker de procesamiento"`, { cardId: findCardId(b3CardMap, "Desplegar worker de procesamiento"), labelName: "Infra" }, 2);
  await addActivity(board3.id, b3MemMap, eve, "member_invited", `Invitó a "Frank Thompson" al tablero`, { memberEmail: frank.email, memberName: frank.name }, 3);
  await addActivity(board3.id, b3MemMap, grace, "stage_created", `Creó la etapa "Planning"`, { stageId: crypto.randomUUID() }, 5);
  await addActivity(board3.id, b3MemMap, dave, "card_moved", `Movió "Implementar extraccion de datos" de "Backlog" a "In Progress"`, { cardId: findCardId(b3CardMap, "Implementar extraccion de datos"), fromStage: "Backlog", toStage: "In Progress" }, 7);
  await addActivity(board3.id, b3MemMap, eve, "member_joined_card", `Asignó a "Grace Kim" en "Implementar extraccion de datos"`, { cardId: findCardId(b3CardMap, "Implementar extraccion de datos"), memberName: grace.name }, 8);

  console.log(`  ✓ ${await prisma.activity.count()} activities added`);

  console.log("\n✅ Seed completed!");
  console.log(`\n📊 Summary:`);
  console.log(`  Users: ${await prisma.user.count()}`);
  console.log(`  Boards: ${await prisma.board.count()}`);
  console.log(`  Memberships: ${await prisma.boardMembership.count()}`);
  console.log(`  Stages: ${await prisma.stage.count()}`);
  console.log(`  Labels: ${await prisma.label.count()}`);
  console.log(`  Cards: ${await prisma.card.count()}`);
  console.log(`  Card members: ${await prisma.cardMember.count()}`);
  console.log(`  Card labels: ${await prisma.cardLabel.count()}`);
  console.log(`  Checklist items: ${await prisma.checklistItem.count()}`);
  console.log(`  Comments: ${await prisma.comment.count()}`);
  console.log(`  Invitations: ${await prisma.invitation.count()}`);
  console.log(`\n🔑 Login: alice@kanban.dev / Passw0rd! (Board 1 owner)`);
  console.log(`🔑 Login: bob@kanban.dev / Passw0rd! (Board 2 owner)`);
  console.log(`🔑 Login: eve@kanban.dev / Passw0rd! (Board 3 owner)`);
  console.log(`🔑 Login: frank@kanban.dev / Passw0rd! (DevOps)`);
  console.log(`🔑 Login: grace@kanban.dev / Passw0rd! (Data Engineer)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
