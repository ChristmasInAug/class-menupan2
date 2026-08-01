import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import XLSX from 'xlsx';
import { SETTINGS_SHEET_NAME } from '../lib/excelParser.mjs';

XLSX.set_fs(fs);

export function createFixtureWorkbook() {
  const workbook = XLSX.utils.book_new();
  const coffeeSheet = XLSX.utils.aoa_to_sheet([
    ['메뉴명', '가격'],
    ['아메리카노', 4500],
  ]);
  XLSX.utils.book_append_sheet(workbook, coffeeSheet, '커피');
  const settingsSheet = XLSX.utils.aoa_to_sheet([
    ['항목', '값'],
    ['매장명', '원래가게'],
    ['테마', 'cafe-dark'],
    ['디바이스', 'signage'],
    ['영문태그', 'TAG'],
    ['자동전환초', 0],
  ]);
  XLSX.utils.book_append_sheet(workbook, settingsSheet, SETTINGS_SHEET_NAME);
  return workbook;
}

export function writeFixtureFile() {
  const filePath = path.join(os.tmpdir(), `menu-test-${Date.now()}-${Math.random().toString(36).slice(2)}.xlsx`);
  XLSX.writeFile(createFixtureWorkbook(), filePath);
  return filePath;
}
