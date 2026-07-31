import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from '../lib/debounce.mjs';

test('shouldCollapseBurstOfFileEventsIntoSingleReparse', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });

  let callCount = 0;
  const debounced = debounce(() => {
    callCount += 1;
  }, 300);

  debounced();
  t.mock.timers.tick(100);
  debounced();
  t.mock.timers.tick(100);
  debounced();
  t.mock.timers.tick(300);

  assert.equal(callCount, 1);
});
