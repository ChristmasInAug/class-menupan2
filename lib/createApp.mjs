import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import XLSX from 'xlsx';
import { buildMenuResponse, parseSettingsSheet, SETTINGS_SHEET_NAME } from './excelParser.mjs';
import { createMenuUpdateEmitter, MENU_UPDATED_EVENT } from './menuUpdateEmitter.mjs';
import { verifyCredentials } from './auth.mjs';
import { createSessionStore } from './session.mjs';
import { writeSettingsToFile } from './settingsWriter.mjs';

XLSX.set_fs(fs);

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(LIB_DIR, '..');
const SESSION_COOKIE = 'admin_session';
const DEBOUNCE_MS = 300;

function readMenuResponse(menuFilePath) {
  const workbook = XLSX.readFile(menuFilePath);
  const sheets = Object.fromEntries(
    workbook.SheetNames.map((name) => [
      name,
      XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }),
    ]),
  );
  return buildMenuResponse(sheets);
}

function readSettings(menuFilePath) {
  const workbook = XLSX.readFile(menuFilePath);
  return parseSettingsSheet(
    XLSX.utils.sheet_to_json(workbook.Sheets[SETTINGS_SHEET_NAME], { header: 1 }),
  );
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((pair) => {
      const i = pair.indexOf('=');
      return [pair.slice(0, i).trim(), decodeURIComponent(pair.slice(i + 1).trim())];
    }),
  );
}

export function createApp(menuFilePath) {
  const app = express();
  const sessionStore = createSessionStore();
  const { emitter, notifyFileChanged } = createMenuUpdateEmitter(DEBOUNCE_MS);

  function requireAdminAuth(req, res, next) {
    const { [SESSION_COOKIE]: token } = parseCookies(req);
    if (sessionStore.verify(token)) return next();
    res.status(401).json({ error: 'unauthorized' });
  }

  app.use(express.json());
  app.use(express.static(path.join(ROOT_DIR, 'public')));
  app.use('/assets', express.static(path.join(ROOT_DIR, 'design/project/assets')));
  app.use('/lib', express.static(path.join(ROOT_DIR, 'lib')));

  app.get('/api/menu', (_req, res) => {
    res.json(readMenuResponse(menuFilePath));
  });

  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');

    const onMenuUpdated = () => {
      res.write(`event: menu-updated\ndata: ${JSON.stringify(readMenuResponse(menuFilePath))}\n\n`);
    };
    emitter.on(MENU_UPDATED_EVENT, onMenuUpdated);

    req.on('close', () => {
      emitter.off(MENU_UPDATED_EVENT, onMenuUpdated);
    });
  });

  app.post('/admin/api/login', (req, res) => {
    const { username, password } = req.body ?? {};
    if (!verifyCredentials(username, password)) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }
    const token = sessionStore.create();
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict`);
    res.json({ ok: true });
  });

  app.post('/admin/api/logout', (req, res) => {
    const { [SESSION_COOKIE]: token } = parseCookies(req);
    sessionStore.revoke(token);
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
    res.json({ ok: true });
  });

  app.get('/admin/api/settings', requireAdminAuth, (_req, res) => {
    res.json(readSettings(menuFilePath));
  });

  app.post('/admin/api/settings', requireAdminAuth, (req, res) => {
    try {
      writeSettingsToFile(menuFilePath, req.body);
      res.json(readSettings(menuFilePath));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return { app, notifyFileChanged };
}
