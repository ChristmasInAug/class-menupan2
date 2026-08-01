import fs from 'node:fs';
import XLSX from 'xlsx';
import { buildSettingsSheetRows, SETTINGS_SHEET_NAME } from './excelParser.mjs';
import { validateSettingsUpdate } from './settingsValidation.mjs';

XLSX.set_fs(fs);

export function writeSettingsToFile(filePath, settings) {
  validateSettingsUpdate(settings);

  const workbook = XLSX.readFile(filePath);
  workbook.Sheets[SETTINGS_SHEET_NAME] = XLSX.utils.aoa_to_sheet(buildSettingsSheetRows(settings));
  if (!workbook.SheetNames.includes(SETTINGS_SHEET_NAME)) {
    workbook.SheetNames.push(SETTINGS_SHEET_NAME);
  }
  XLSX.writeFile(workbook, filePath);
}
