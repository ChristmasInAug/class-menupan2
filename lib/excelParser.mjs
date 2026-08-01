const MENU_ITEM_FIELDS = ['메뉴명', '가격', '설명', '품절', '카테고리'];

export function parseSheetRows(rows) {
  const [header, ...body] = rows;
  return body.map((row) =>
    Object.fromEntries(
      header
        .map((key, i) => [key, row[i]])
        .filter(([key]) => MENU_ITEM_FIELDS.includes(key)),
    ),
  );
}

function isPageSheet(title) {
  return !title.startsWith('_');
}

export function parseWorkbookToPages(sheets) {
  return Object.entries(sheets)
    .filter(([title]) => isPageSheet(title))
    .map(([title, rows]) => ({
      title,
      items: parseSheetRows(rows),
    }));
}

const DEFAULT_SETTINGS = {
  테마: 'cafe-dark',
  자동전환초: 0,
};

export function parseSettingsSheet(rows) {
  const [, ...body] = rows;
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(body) };
}

export function buildSettingsSheetRows(settings) {
  return [['항목', '값'], ...Object.entries(settings)];
}

export function isSoldOut(value) {
  return value === 'Y';
}

export function parsePrice(value) {
  const price = Number(value);
  if (Number.isNaN(price)) {
    throw new Error(`가격은 숫자여야 합니다: ${value}`);
  }
  return price;
}

export const SETTINGS_SHEET_NAME = '_설정';

export function buildMenuResponse(sheets) {
  const settings = parseSettingsSheet(sheets[SETTINGS_SHEET_NAME]);
  const pages = parseWorkbookToPages(sheets);
  return { ...settings, pages };
}
