import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMenuUpdateEmitter, MENU_UPDATED_EVENT } from '../lib/menuUpdateEmitter.mjs';

test('shouldEmitMenuUpdatedEventExactlyOnceAfterDebounce', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });

  const { emitter, notifyFileChanged } = createMenuUpdateEmitter(300);
  let emitCount = 0;
  emitter.on(MENU_UPDATED_EVENT, () => {
    emitCount += 1;
  });

  notifyFileChanged();
  t.mock.timers.tick(100);
  notifyFileChanged();
  t.mock.timers.tick(100);
  notifyFileChanged();
  t.mock.timers.tick(300);

  assert.equal(emitCount, 1);
});
