import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import chokidar from 'chokidar';
import XLSX from 'xlsx';
import { buildMenuResponse } from './lib/excelParser.mjs';
import { createMenuUpdateEmitter, MENU_UPDATED_EVENT } from './lib/menuUpdateEmitter.mjs';

XLSX.set_fs(fs);

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MENU_FILE = path.join(ROOT_DIR, 'data/menu.xlsx');
const DEBOUNCE_MS = 300;

function readMenuResponse() {
  const workbook = XLSX.readFile(MENU_FILE);
  const sheets = Object.fromEntries(
    workbook.SheetNames.map((name) => [
      name,
      XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }),
    ]),
  );
  return buildMenuResponse(sheets);
}

const app = express();
app.use(express.static(path.join(ROOT_DIR, 'public')));
app.use('/assets', express.static(path.join(ROOT_DIR, 'design/project/assets')));
app.use('/lib', express.static(path.join(ROOT_DIR, 'lib')));

app.get('/api/menu', (_req, res) => {
  res.json(readMenuResponse());
});

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  const onMenuUpdated = () => {
    res.write(`event: menu-updated\ndata: ${JSON.stringify(readMenuResponse())}\n\n`);
  };
  emitter.on(MENU_UPDATED_EVENT, onMenuUpdated);

  req.on('close', () => {
    emitter.off(MENU_UPDATED_EVENT, onMenuUpdated);
  });
});

const { emitter, notifyFileChanged } = createMenuUpdateEmitter(DEBOUNCE_MS);

chokidar.watch(MENU_FILE).on('change', notifyFileChanged);

app.listen(PORT, () => {
  console.log(`카페 메뉴판: http://localhost:${PORT}`);
});
