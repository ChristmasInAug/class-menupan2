import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listPageTitles, findPageIndexByTitle } from '../lib/pageNav.mjs';

test('shouldListAllPageTitlesForTabs', () => {
  const pages = [
    { title: '커피', items: [] },
    { title: '디저트', items: [] },
    { title: '음료', items: [] },
  ];

  assert.deepEqual(listPageTitles(pages), ['커피', '디저트', '음료']);
});

test('shouldFindPageIndexByTitle', () => {
  const pages = [
    { title: '커피', items: [] },
    { title: '디저트', items: [] },
    { title: '음료', items: [] },
  ];

  assert.equal(findPageIndexByTitle(pages, '디저트'), 1);
});

test('shouldFallBackToFirstPageIndexWhenTitleNotFound', () => {
  const pages = [
    { title: '커피', items: [] },
    { title: '디저트', items: [] },
  ];

  assert.equal(findPageIndexByTitle(pages, '없는시트'), 0);
});
