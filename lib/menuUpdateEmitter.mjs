import { EventEmitter } from 'node:events';
import { debounce } from './debounce.mjs';

export const MENU_UPDATED_EVENT = 'menu-updated';

export function createMenuUpdateEmitter(delayMs) {
  const emitter = new EventEmitter();
  const notifyFileChanged = debounce(() => {
    emitter.emit(MENU_UPDATED_EVENT);
  }, delayMs);

  return { emitter, notifyFileChanged };
}
