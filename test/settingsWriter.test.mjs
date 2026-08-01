import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import XLSX from 'xlsx';
import { writeSettingsToFile } from '../lib/settingsWriter.mjs';
import { parseSettingsSheet, SETTINGS_SHEET_NAME } from '../lib/excelParser.mjs';
import { writeFixtureFile } from '../testHelpers/xlsxFixture.mjs';

XLSX.set_fs(fs);

test('shouldPersistSettingsUpdateAndReflectOnNextRead', () => {
  const tmpFile = writeFixtureFile();

  try {
    writeSettingsToFile(tmpFile, {
      매장명: '새가게',
      테마: 'deep-green',
      디바이스: 'tablet-port',
      영문태그: 'NEW TAG',
      자동전환초: 5,
    });

    const workbook = XLSX.readFile(tmpFile);
    const settings = parseSettingsSheet(
      XLSX.utils.sheet_to_json(workbook.Sheets[SETTINGS_SHEET_NAME], { header: 1 }),
    );

    assert.deepEqual(settings, {
      매장명: '새가게',
      테마: 'deep-green',
      디바이스: 'tablet-port',
      영문태그: 'NEW TAG',
      자동전환초: 5,
    });
    assert.ok(workbook.SheetNames.includes('커피'), '다른 시트는 그대로 남아 있어야 한다');
  } finally {
    fs.rmSync(tmpFile, { force: true });
  }
});
