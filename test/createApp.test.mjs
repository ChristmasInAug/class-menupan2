import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createApp } from '../lib/createApp.mjs';
import { writeFixtureFile } from '../testHelpers/xlsxFixture.mjs';

test('shouldRequireAuthToAccessAdminApi', async () => {
  const tmpFile = writeFixtureFile();
  const { app } = createApp(tmpFile);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const unauthenticated = await fetch(`http://localhost:${port}/admin/api/settings`);
    assert.equal(unauthenticated.status, 401);

    const login = await fetch(`http://localhost:${port}/admin/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '1234' }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];

    const authenticated = await fetch(`http://localhost:${port}/admin/api/settings`, {
      headers: { Cookie: cookie },
    });
    assert.equal(authenticated.status, 200);
  } finally {
    server.close();
    fs.rmSync(tmpFile, { force: true });
  }
});
