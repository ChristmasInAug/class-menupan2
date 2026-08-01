import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSettingsUpdate } from '../lib/settingsValidation.mjs';

const VALID_SETTINGS = {
  매장명: '빌런 커피',
  테마: 'deep-green',
  디바이스: 'tablet-port',
  영문태그: 'SPECIALTY COFFEE',
  자동전환초: 0,
};

test('shouldRejectUnknownThemeKeyOnSettingsUpdate', () => {
  assert.throws(() => validateSettingsUpdate({ ...VALID_SETTINGS, 테마: 'not-a-theme' }));
});

test('shouldRejectUnknownDeviceKeyOnSettingsUpdate', () => {
  assert.throws(() => validateSettingsUpdate({ ...VALID_SETTINGS, 디바이스: 'not-a-device' }));
});
