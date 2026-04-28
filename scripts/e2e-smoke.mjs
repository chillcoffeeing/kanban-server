#!/usr/bin/env node
/**
 * Smoke test E2E contra el backend en localhost:3000.
 * Prueba: auth, boards, stages, cards, members, invitations, permissions.
 *
 * Ejecuta: node scripts/e2e-smoke.mjs
 * Opcional: API_BASE=https://kanban-server-zpq5.onrender.com/api/v1 node scripts/e2e-smoke.mjs
 */

const apiBaseUrl = process.env.API_BASE ?? 'http://localhost:3000/api/v1';
const randomSuffix = Math.random().toString(36).slice(2, 8);

let passedCount = 0;
let failedCount = 0;

function logResult(ok, testName, extra = '') {
  const tag = ok ? '[PASS]' : '[FAIL]';
  console.log(`${tag} ${testName}${extra ? ' - ' + extra : ''}`);
  if (ok) passedCount++;
  else failedCount++;
}

async function request(method, path, { token, body, expect = 200 } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const rawText = await response.text();
  let parsedBody = null;
  try {
    parsedBody = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsedBody = rawText;
  }
  const expectedOk = Array.isArray(expect)
    ? expect.includes(response.status)
    : response.status === expect;
  if (!expectedOk) {
    console.error(`  ${method} ${path} esperado ${expect}, recibido ${response.status}`);
    console.error('  ', typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody));
  }
  return { ok: expectedOk, status: response.status, data: parsedBody };
}

async function main() {
  console.log(`\nSmoke E2E - ${apiBaseUrl}\n`);

  // 1. Health
  {
    const result = await request('GET', '/health');
    logResult(result.ok && result.data?.status === 'ok', 'GET /health', result.data?.status);
  }

  // 2. Register user 1 (owner)
  const email1 = `owner_${randomSuffix}@example.com`;
  const password = 'Passw0rd!';
  let token1;
  {
    const result = await request('POST', '/auth/register', {
      body: { email: email1, name: `Owner ${randomSuffix}`, password },
      expect: [200, 201],
    });
    token1 = result.data?.accessToken;
    logResult(result.ok && !!token1, 'POST /auth/register (owner)', email1);
  }

  // 3. Register user 2 (member)
  const email2 = `member_${randomSuffix}@example.com`;
  let token2;
  {
    const result = await request('POST', '/auth/register', {
      body: { email: email2, name: `Member ${randomSuffix}`, password },
      expect: [200, 201],
    });
    token2 = result.data?.accessToken;
    logResult(result.ok && !!token2, 'POST /auth/register (member)', email2);
  }

  // 4. Login
  {
    const result = await request('POST', '/auth/login', {
      body: { email: email1, password },
      expect: 200,
    });
    if (result.data?.accessToken) token1 = result.data.accessToken;
    logResult(result.ok && !!result.data?.accessToken, 'POST /auth/login');
  }

  // 5. Account
  {
    const result = await request('GET', '/auth/account', { token: token1 });
    logResult(result.ok && result.data?.email === email1, 'GET /auth/account');
  }

  // 6. Create board (owner should have all permissions)
  let boardId;
  {
    const result = await request('POST', '/boards', {
      token: token1,
      body: { name: `Board ${randomSuffix}`, background: '#4f46e5' },
      expect: [200, 201],
    });
    boardId = result.data?.id;
    logResult(result.ok && !!boardId, 'POST /boards', boardId);

    // Verify owner has all permissions
    if (boardId && token1) {
      const boardResult = await request('GET', `/boards/${boardId}/full`, { token: token1 });
      const ownerMember = boardResult.data?.members?.find(m => m.role === 'owner');
      const hasAllPerms = ownerMember?.permissions?.includes('create_stage')
        && ownerMember?.permissions?.includes('create_card')
        && ownerMember?.permissions?.includes('modify_card')
        && ownerMember?.permissions?.includes('delete_card')
        && ownerMember?.permissions?.includes('invite_member');
      logResult(hasAllPerms, 'Owner has all permissions by default', 
        `perms: ${JSON.stringify(ownerMember?.permissions)}`);
    }
  }

  // 7. List boards
  {
    const result = await request('GET', '/boards', { token: token1 });
    const found = Array.isArray(result.data) && result.data.some((board) => board.id === boardId);
    logResult(result.ok && found, 'GET /boards', `n=${result.data?.length}`);
  }

  // 8. Get board
  {
    const result = await request('GET', `/boards/${boardId}`, { token: token1 });
    logResult(result.ok && result.data?.id === boardId, 'GET /boards/:id');
  }

  // 9. Update board
  {
    const result = await request('PATCH', `/boards/${boardId}`, {
      token: token1,
      body: { name: `Board ${randomSuffix} v2` },
    });
    logResult(result.ok && result.data?.name?.endsWith('v2'), 'PATCH /boards/:id');
  }

  // 10. Invite member (create invitation)
  let invitationToken;
  {
    const result = await request('POST', `/boards/${boardId}/invitations`, {
      token: token1,
      body: { email: email2, role: 'member' },
      expect: [200, 201],
    });
    invitationToken = result.data?.token;
    logResult(result.ok && !!invitationToken, 'POST /boards/:id/invitations', 'pending invitation created');
  }

  // 11. List board invitations (as owner)
  {
    const result = await request('GET', `/boards/${boardId}/invitations`, {
      token: token1,
    });
    const hasPending = Array.isArray(result.data) && result.data.some(inv => inv.email === email2);
    logResult(result.ok && hasPending, 'GET /boards/:id/invitations', `pending=${result.data?.length}`);
  }

  // 12. List user pending invitations (as invitee)
  {
    const result = await request('GET', '/invitations/pending', { token: token2 });
    const hasInv = Array.isArray(result.data) && result.data.some(inv => inv.email === email2);
    logResult(result.ok && hasInv, 'GET /invitations/pending', `pending=${result.data?.length}`);
  }

  // 13. Accept invitation
  {
    const result = await request('POST', `/invitations/${invitationToken}/accept`, {
      token: token2,
      expect: 200,
    });
    logResult(result.ok, 'POST /invitations/:token/accept', 'member accepted');
  }

  // 14. Verify member appears in board members
  {
    const result = await request('GET', `/boards/${boardId}/members`, { token: token1 });
    const memberFound = Array.isArray(result.data) && result.data.some(m => m.userId === result.data?.[1]?.userId);
    const memberCount = result.data?.length;
    logResult(result.ok && memberCount === 2, 'GET /boards/:id/members', `count=${memberCount}`);
  }

  // 15. Create stage
  let firstStageId;
  {
    const result = await request('POST', `/boards/${boardId}/stages`, {
      token: token1,
      body: { name: 'To Do' },
      expect: [200, 201],
    });
    firstStageId = result.data?.id;
    logResult(result.ok && !!firstStageId, 'POST /boards/:id/stages', firstStageId);
  }

  // 16. Create second stage
  let secondStageId;
  {
    const result = await request('POST', `/boards/${boardId}/stages`, {
      token: token1,
      body: { name: 'Done' },
      expect: [200, 201],
    });
    secondStageId = result.data?.id;
    logResult(result.ok && !!secondStageId, 'POST /boards/:id/stages #2');
  }

  // 17. Create card
  let cardId;
  {
    const result = await request('POST', `/stages/${firstStageId}/cards`, {
      token: token1,
      body: { title: `Task ${randomSuffix}`, description: 'lorem ipsum' },
      expect: [200, 201],
    });
    cardId = result.data?.id;
    logResult(result.ok && !!cardId, 'POST /stages/:id/cards', cardId);
  }

  // 18. Get card
  {
    const result = await request('GET', `/cards/${cardId}`, { token: token1 });
    logResult(result.ok && result.data?.id === cardId, 'GET /cards/:id');
  }

  // 19. Update card
  {
    const result = await request('PATCH', `/cards/${cardId}`, {
      token: token1,
      body: { title: `Task ${randomSuffix} updated` },
    });
    logResult(result.ok && result.data?.title?.endsWith('updated'), 'PATCH /cards/:id');
  }

  // 20. Move card to second stage
  {
    const result = await request('PATCH', `/cards/${cardId}/move`, {
      token: token1,
      body: { stageId: secondStageId, index: 0 },
    });
    logResult(result.ok && result.data?.stageId === secondStageId, 'PATCH /cards/:id/move');
  }

  // 21. Search cards
  {
    const result = await request('GET', `/boards/${boardId}/cards/search?q=${randomSuffix}`, { token: token1 });
    logResult(result.ok && Array.isArray(result.data) && result.data.length >= 1, 'GET /boards/:id/cards/search');
  }

  // 22. Delete card
  {
    const result = await request('DELETE', `/cards/${cardId}`, { token: token1, expect: 204 });
    logResult(result.ok, 'DELETE /cards/:id');
  }

  // 23. Delete stages
  {
    const firstDelete = await request('DELETE', `/stages/${firstStageId}`, { token: token1, expect: 204 });
    const secondDelete = await request('DELETE', `/stages/${secondStageId}`, { token: token1, expect: 204 });
    logResult(firstDelete.ok && secondDelete.ok, 'DELETE /stages/:id x2');
  }

  // 24. Reject/delete invitation (create new one first)
  {
    const invResult = await request('POST', `/boards/${boardId}/invitations`, {
      token: token1,
      body: { email: `reject_${randomSuffix}@example.com`, role: 'member' },
      expect: [200, 201],
    });
    const tempInvId = invResult.data?.id;
    const delResult = await request('DELETE', `/invitations/${tempInvId}`, {
      token: token1,
      expect: [200, 204],
    });
    logResult(delResult.ok, 'DELETE /invitations/:id (reject)');
  }

  // 25. Delete board
  {
    const result = await request('DELETE', `/boards/${boardId}`, { token: token1, expect: 204 });
    logResult(result.ok, 'DELETE /boards/:id');
  }

  // 26. Auth guard (sin token)
  {
    const result = await request('GET', '/boards', { expect: 401 });
    logResult(result.ok, 'GET /boards sin token, espera 401');
  }

  console.log(`\n${passedCount} pass, ${failedCount} fail\n`);
  process.exit(failedCount === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
