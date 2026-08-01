import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSheetRows,
  parseWorkbookToPages,
  parseSettingsSheet,
  buildSettingsSheetRows,
  isSoldOut,
  parsePrice,
  buildMenuResponse,
} from '../lib/excelParser.mjs';

test('shouldParseHeaderRowAsColumnNames', () => {
  const rows = [
    ['메뉴명', '가격', '설명', '품절', '카테고리'],
    ['아메리카노', 4500, '깔끔한 산미', '', '에스프레소'],
  ];

  const items = parseSheetRows(rows);

  assert.deepEqual(items, [
    { 메뉴명: '아메리카노', 가격: 4500, 설명: '깔끔한 산미', 품절: '', 카테고리: '에스프레소' },
  ]);
});

test('shouldConvertNonUnderscoreSheetToPage', () => {
  const sheets = {
    커피: [
      ['메뉴명', '가격', '설명', '품절', '카테고리'],
      ['아메리카노', 4500, '깔끔한 산미', '', '에스프레소'],
    ],
  };

  const pages = parseWorkbookToPages(sheets);

  assert.deepEqual(pages, [
    {
      title: '커피',
      items: [
        { 메뉴명: '아메리카노', 가격: 4500, 설명: '깔끔한 산미', 품절: '', 카테고리: '에스프레소' },
      ],
    },
  ]);
});

test('shouldExcludeUnderscorePrefixedSheetFromPages', () => {
  const sheets = {
    커피: [
      ['메뉴명', '가격'],
      ['아메리카노', 4500],
    ],
    _설정: [
      ['항목', '값'],
      ['매장명', '빌런 커피'],
    ],
  };

  const pages = parseWorkbookToPages(sheets);

  assert.deepEqual(pages, [
    {
      title: '커피',
      items: [{ 메뉴명: '아메리카노', 가격: 4500 }],
    },
  ]);
});

test('shouldMapRowsToMenuItemFields', () => {
  const rows = [
    ['메뉴명', '가격', '설명', '품절', '카테고리', '메모'],
    ['아메리카노', 4500, '깔끔한 산미', '', '에스프레소', '베스트셀러'],
  ];

  const items = parseSheetRows(rows);

  assert.deepEqual(items, [
    { 메뉴명: '아메리카노', 가격: 4500, 설명: '깔끔한 산미', 품절: '', 카테고리: '에스프레소' },
  ]);
});

test('shouldParseSettingsSheetAsKeyValuePairs', () => {
  const rows = [
    ['항목', '값'],
    ['매장명', '빌런 커피'],
    ['테마', 'cafe-dark'],
    ['자동전환초', 0],
  ];

  const settings = parseSettingsSheet(rows);

  assert.deepEqual(settings, {
    매장명: '빌런 커피',
    테마: 'cafe-dark',
    자동전환초: 0,
  });
});

test('shouldDefaultThemeWhenSettingsMissing', () => {
  const rows = [
    ['항목', '값'],
    ['매장명', '빌런 커피'],
  ];

  const settings = parseSettingsSheet(rows);

  assert.equal(settings.테마, 'cafe-dark');
});

test('shouldDefaultAutoRotateSecondsToZeroWhenMissing', () => {
  const rows = [
    ['항목', '값'],
    ['매장명', '빌런 커피'],
  ];

  const settings = parseSettingsSheet(rows);

  assert.equal(settings.자동전환초, 0);
});

test('shouldMarkSoldOutOnlyWhenValueIsExactlyY', () => {
  assert.equal(isSoldOut('Y'), true);
});

test('shouldTreatBlankSoldOutAsAvailable', () => {
  assert.equal(isSoldOut(''), false);
});

test('shouldParseNumericPriceAsNumber', () => {
  const price = parsePrice('4500');

  assert.equal(price, 4500);
  assert.equal(typeof price, 'number');
});

test('shouldRejectNonNumericPriceInput', () => {
  assert.throws(() => parsePrice('₩4,500'));
});

test('shouldSerializeSettingsObjectToSheetRows', () => {
  const settings = {
    매장명: '빌런 커피',
    테마: 'deep-green',
    디바이스: 'tablet-port',
    영문태그: 'SPECIALTY COFFEE',
    자동전환초: 0,
  };

  const rows = buildSettingsSheetRows(settings);

  assert.deepEqual(rows[0], ['항목', '값']);
  assert.deepEqual(parseSettingsSheet(rows), settings);
});

test('shouldReturnPagesArrayWithStoreNameThemeAutoRotate', () => {
  const sheets = {
    커피: [
      ['메뉴명', '가격'],
      ['아메리카노', 4500],
    ],
    _설정: [
      ['항목', '값'],
      ['매장명', '빌런 커피'],
      ['테마', 'cafe-dark'],
      ['자동전환초', 0],
    ],
  };

  const response = buildMenuResponse(sheets);

  assert.deepEqual(response, {
    매장명: '빌런 커피',
    테마: 'cafe-dark',
    자동전환초: 0,
    pages: [{ title: '커피', items: [{ 메뉴명: '아메리카노', 가격: 4500 }] }],
  });
});
