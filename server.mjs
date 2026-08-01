import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';
import { createApp } from './lib/createApp.mjs';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MENU_FILE = path.join(ROOT_DIR, 'data/menu.xlsx');

const { app, notifyFileChanged } = createApp(MENU_FILE);

chokidar.watch(MENU_FILE).on('change', notifyFileChanged);

app.listen(PORT, () => {
  console.log(`카페 메뉴판: http://localhost:${PORT}`);
});
