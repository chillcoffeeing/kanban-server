import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";
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
  await prisma.boardMembership.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("  ✓ Database cleaned");

  // 1. Create users
  console.log("📝 Creating users...");
  const seedUsers: SeedUser[] = [
    { email: "alice@kanban.dev", name: "Alice Martin", role: "Tech Lead", username: "alice_m" },
    { email: "bob@kanban.dev", name: "Bob Navarro", role: "Frontend Dev", username: "bob_n" },
    { email: "carol@kanban.dev", name: "Carol Rodriguez", role: "UX Designer", username: "carol_r" },
    { email: "dave@kanban.dev", name: "Dave Wilson", role: "Backend Dev", username: "dave_w" },
    { email: "eve@kanban.dev", name: "Eve Chen", role: "Mobile Dev", username: "eve_c" },
  ];

  const users: { id: string; email: string; name: string; role: string; username: string }[] = [];
  for (const u of seedUsers) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        username: u.username,
        passwordHash: await bcrypt.hash(
          "Passw0rd!",
          process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS) : 10,
        ),
        avatarUrl: `https://i.pravatar.cc/150?u=${u.email}`,
        roles: [u.role],
      },
    });
    users.push({ ...u, id: user.id });
    console.log(`  ✓ ${user.name} (${user.email})`);
  }

  // 2. Create profiles and preferences for users
  console.log("\n📋 Creating profiles and preferences...");
  const profileData = [
    {
      userId: users[0].id,
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
    {
      userId: users[1].id,
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
    {
      userId: users[2].id,
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
    {
      userId: users[3].id,
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
    {
      userId: users[4].id,
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
  ];

  for (const p of profileData) {
    await prisma.profile.create({ data: p });
  }

  for (const u of users) {
    await prisma.userPreference.create({
      data: {
        userId: u.id,
        theme: "light",
        language: "es",
        dateFormat: "DMY",
        timeFormat: "24h",
      },
    });
  }
  console.log("  ✓ Profiles and preferences created");

  const [alice, bob, carol, dave, eve] = users;

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
      settings: JSON.parse(JSON.stringify({
        showMembers: true,
        showLabels: true,
        cardCover: false,
      })),
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
      settings: JSON.parse(JSON.stringify({
        showMembers: true,
        showLabels: true,
        cardCover: false,
      })),
    },
  });

  // 4. Board 1 memberships
  console.log("\n👥 Board 1 memberships...");
  const b1Memberships = [
    { userId: alice.id, role: "owner" as const, perms: ALL_PERMISSIONS },
    { userId: bob.id, role: "admin" as const, perms: [] },
    { userId: carol.id, role: "member" as const, perms: [] },
    { userId: dave.id, role: "member" as const, perms: [] },
  ];
  const b1MemMap = new Map();
  for (const m of b1Memberships) {
    const created = await prisma.boardMembership.create({
      data: {
        boardId: board1.id,
        userId: m.userId,
        role: m.role,
        permissions: m.perms,
      },
    });
    b1MemMap.set(m.userId, created);
    console.log(
      `  ✓ ${users.find((u) => u.id === m.userId)?.name} (${m.role})`,
    );
  }

  // 5. Board 2 memberships
  console.log("\n👥 Board 2 memberships...");
  const b2Memberships = [
    { userId: bob.id, role: "owner" as const, perms: ALL_PERMISSIONS },
    { userId: carol.id, role: "admin" as const, perms: [] },
    { userId: eve.id, role: "member" as const, perms: [] },
  ];
  const b2MemMap = new Map();
  for (const m of b2Memberships) {
    const created = await prisma.boardMembership.create({
      data: {
        boardId: board2.id,
        userId: m.userId,
        role: m.role,
        permissions: m.perms,
      },
    });
    b2MemMap.set(m.userId, created);
    console.log(
      `  ✓ ${users.find((u) => u.id === m.userId)?.name} (${m.role})`,
    );
  }

  // 6. Pending invitations
  console.log("\n📨 Pending invitations...");
  const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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

  // 7. Labels Board 1
  console.log("\n🏷️  Labels for Board 1...");
  const b1Labels = [
    { name: "Accessibility", color: "#9333ea" },
    { name: "UI/UX", color: "#3b82f6" },
    { name: "Refactor", color: "#f59e0b" },
    { name: "Bug", color: "#ef4444" },
  ];
  const b1LabelMap = new Map();
  for (const l of b1Labels) {
    const label = await prisma.label.create({
      data: { boardId: board1.id, name: l.name, color: l.color },
    });
    b1LabelMap.set(l.name, label);
    console.log(`  ✓ ${l.name}`);
  }

  // 8. Labels Board 2
  console.log("\n🏷️  Labels for Board 2...");
  const b2Labels = [
    { name: "Mobile", color: "#10b981" },
    { name: "API", color: "#8b5cf6" },
    { name: "Design", color: "#ec4899" },
  ];
  const b2LabelMap = new Map();
  for (const l of b2Labels) {
    const label = await prisma.label.create({
      data: { boardId: board2.id, name: l.name, color: l.color },
    });
    b2LabelMap.set(l.name, label);
    console.log(`  ✓ ${l.name}`);
  }

  // 9. Stages Board 1
  console.log("\n📊 Stages for Board 1...");
  const stageNames = ["Backlog", "In Progress", "Review", "Done"];
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

  // Helper to create cards
  async function createCards(
    boardStages: any,
    boardLabels: any,
    boardMemMap: any,
    cardsPlan: any,
    boardNum: any,
  ) {
    console.log(`\n📝 Cards for Board ${boardNum}...`);
    let pos = 1;
    for (const c of cardsPlan) {
      const stage = boardStages[c.stageIndex];
      const card = await prisma.card.create({
        data: {
          stageId: stage.id,
          title: c.title,
          description: c.description,
          position: pos++,
        },
      });

      // Labels
      if (c.labelNames) {
        for (const ln of c.labelNames) {
          const label = boardLabels.get(ln);
          if (label)
            await prisma.cardLabel.create({
              data: { cardId: card.id, labelId: label.id },
            });
        }
      }

      // Members via boardMembershipId
      if (c.assigneeEmails) {
        for (const email of c.assigneeEmails) {
          const user = users.find((u) => u.email === email);
          if (user) {
            const mem = boardMemMap.get(user.id);
            if (mem)
              await prisma.cardMember.create({
                data: { cardId: card.id, boardMembershipId: mem.id },
              });
          }
        }
      }

      // Checklist
      if (c.checklist) {
        for (let i = 0; i < c.checklist.length; i++) {
          await prisma.checklistItem.create({
            data: {
              cardId: card.id,
              text: c.checklist[i].text,
              done: c.checklist[i].done,
              position: i + 1,
            },
          });
        }
      }

      console.log(`  ✓ [${stage.name}] ${card.title}`);
    }
  }

  // Board 1 cards
  await createCards(
    b1Stages,
    b1LabelMap,
    b1MemMap,
    [
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
        stageIndex: 0,
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
    ],
    1,
  );

  // Board 2 cards
  await createCards(
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
    ],
    2,
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
          authorId: b1MemMap.get(alice.id).id,  // Use BoardMembership ID
          body: "Let's get this started! WCAG 2.1 AA compliance.",
        },
        {
          cardId: b1FirstCard.id,
          authorId: b1MemMap.get(carol.id).id,  // Use BoardMembership ID
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
          authorId: b2MemMap.get(bob.id).id,  // Use BoardMembership ID
          body: "Setting up Expo with TypeScript.",
        },
        {
          cardId: b2FirstCard.id,
          authorId: b2MemMap.get(eve.id).id,  // Use BoardMembership ID
          body: "I'll handle navigation setup.",
        },
      ],
    });
  }
  console.log("  ✓ Comments added");

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
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
