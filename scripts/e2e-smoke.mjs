#!/usr/bin/env node
/**
 * Smoke test E2E contra el backend en localhost:3000.
 * Ejecuta: node scripts/e2e-smoke.mjs
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

  // 2. Register
  const email = `test_${randomSuffix}@example.com`;
  const password = 'Passw0rd!';
  let accessToken;
  {
    const result = await request('POST', '/auth/register', {
      body: { email, name: `Test ${randomSuffix}`, password },
      expect: [200, 201],
    });
    accessToken = result.data?.accessToken;
    logResult(result.ok && !!accessToken, 'POST /auth/register', email);
  }

  // 3. Login
  {
    const result = await request('POST', '/auth/login', {
      body: { email, password },
      expect: 200,
    });
    if (result.data?.accessToken) accessToken = result.data.accessToken;
    logResult(result.ok && !!result.data?.accessToken, 'POST /auth/login');
  }

  // 4. Account
  {
    const result = await request('GET', '/auth/account', { token: accessToken });
    logResult(result.ok && result.data?.email === email, 'GET /auth/account');
  }

  // 5. Create board
  let boardId;
  {
    const result = await request('POST', '/boards', {
      token: accessToken,
      body: { name: `Board ${randomSuffix}`, background: '#4f46e5' },
      expect: [200, 201],
    });
    boardId = result.data?.id;
    logResult(result.ok && !!boardId, 'POST /boards', boardId);
  }

  // 6. List boards
  {
    const result = await request('GET', '/boards', { token: accessToken });
    const found = Array.isArray(result.data) && result.data.some((board) => board.id === boardId);
    logResult(result.ok && found, 'GET /boards', `n=${result.data?.length}`);
  }

  // 7. Get board
  {
    const result = await request('GET', `/boards/${boardId}`, { token: accessToken });
    logResult(result.ok && result.data?.id === boardId, 'GET /boards/:id');
  }

  // 8. Update board
  {
    const result = await request('PATCH', `/boards/${boardId}`, {
      token: accessToken,
      body: { name: `Board ${randomSuffix} v2` },
    });
    logResult(result.ok && result.data?.name?.endsWith('v2'), 'PATCH /boards/:id');
  }

  // 9. Create stage
  let firstStageId;
  {
    const result = await request('POST', `/boards/${boardId}/stages`, {
      token: accessToken,
      body: { name: 'To Do' },
      expect: [200, 201],
    });
    firstStageId = result.data?.id;
    logResult(result.ok && !!firstStageId, 'POST /boards/:id/stages', firstStageId);
  }

  // 10. Create second stage
  let secondStageId;
  {
    const result = await request('POST', `/boards/${boardId}/stages`, {
      token: accessToken,
      body: { name: 'Done' },
      expect: [200, 201],
    });
    secondStageId = result.data?.id;
    logResult(result.ok && !!secondStageId, 'POST /boards/:id/stages #2');
  }

  // 11. Create card
  let cardId;
  {
    const result = await request('POST', `/stages/${firstStageId}/cards`, {
      token: accessToken,
      body: { title: `Task ${randomSuffix}`, description: 'lorem ipsum' },
      expect: [200, 201],
    });
    cardId = result.data?.id;
    logResult(result.ok && !!cardId, 'POST /stages/:id/cards', cardId);
  }

  // 12. Get card
  {
    const result = await request('GET', `/cards/${cardId}`, { token: accessToken });
    logResult(result.ok && result.data?.id === cardId, 'GET /cards/:id');
  }

  // 13. Update card
  {
    const result = await request('PATCH', `/cards/${cardId}`, {
      token: accessToken,
      body: { title: `Task ${randomSuffix} updated` },
    });
    logResult(result.ok && result.data?.title?.endsWith('updated'), 'PATCH /cards/:id');
  }

  // 14. Move card to second stage
  {
    const result = await request('PATCH', `/cards/${cardId}/move`, {
      token: accessToken,
      body: { stageId: secondStageId, index: 0 },
    });
    logResult(result.ok && result.data?.stageId === secondStageId, 'PATCH /cards/:id/move');
  }

  // 15. Search cards
  {
    const result = await request('GET', `/boards/${boardId}/cards/search?q=${randomSuffix}`, { token: accessToken });
    logResult(result.ok && Array.isArray(result.data) && result.data.length >= 1, 'GET /boards/:id/cards/search');
  }

  // 16. Delete card
  {
    const result = await request('DELETE', `/cards/${cardId}`, { token: accessToken, expect: 204 });
    logResult(result.ok, 'DELETE /cards/:id');
  }

  // 17. Delete stages
  {
    const firstDelete = await request('DELETE', `/stages/${firstStageId}`, { token: accessToken, expect: 204 });
    const secondDelete = await request('DELETE', `/stages/${secondStageId}`, { token: accessToken, expect: 204 });
    logResult(firstDelete.ok && secondDelete.ok, 'DELETE /stages/:id x2');
  }

  // 18. Delete board
  {
    const result = await request('DELETE', `/boards/${boardId}`, { token: accessToken, expect: 204 });
    logResult(result.ok, 'DELETE /boards/:id');
  }

  // 19. Auth guard (sin token)
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
