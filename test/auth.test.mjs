import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyCredentials } from '../lib/auth.mjs';

test('shouldAcceptCorrectAdminCredentials', () => {
  assert.equal(verifyCredentials('admin', '1234'), true);
});

test('shouldRejectIncorrectAdminCredentials', () => {
  assert.equal(verifyCredentials('admin', 'wrong'), false);
  assert.equal(verifyCredentials('nobody', '1234'), false);
});
