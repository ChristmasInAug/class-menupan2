import { listPageTitles, findPageIndexByTitle } from '/lib/pageNav.mjs';

const THEMES = {
  'light-olive': { text: '#33381f', sub: '#6e7350', accent: '#6f7637' },
  'deep-green': { text: '#f0ecd8', sub: '#a9bcab', accent: '#c8a24a' },
  cream: { text: '#3c3120', sub: '#897354', accent: '#b5602f' },
  beige: { text: '#352a1a', sub: '#827049', accent: '#7a8246' },
  'cafe-dark': { text: '#f2e8d8', sub: '#b8a68c', accent: '#c9973f' },
  'bistro-light': { text: '#3a2f28', sub: '#7d6f63', accent: '#a8432e' },
  'forest-dark': { text: '#e6ede6', sub: '#94a892', accent: '#c9a15a' },
  'forest-light': { text: '#223324', sub: '#5f7561', accent: '#3f7d4a' },
};

const DEFAULT_THEME = 'cafe-dark';
const DEFAULT_DEVICE = 'signage';

const boardEl = document.getElementById('board');
const eyebrowEl = document.getElementById('eyebrow');
const storeEl = document.getElementById('store');
const sheetTabsEl = document.getElementById('sheet-tabs');
const sheetMetaEl = document.getElementById('sheet-meta');
const itemListEl = document.getElementById('item-list');

let currentData = null;
let currentPageIndex = 0;
let rotateTimer = null;

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원';
}

function renderItem(item) {
  const isSoldOut = item.품절 === 'Y';

  const wrap = document.createElement('div');
  wrap.className = 'board__item' + (isSoldOut ? ' board__item--sold-out' : '');

  const row = document.createElement('div');
  row.className = 'board__item-row';

  const name = document.createElement('span');
  name.className = 'board__item-name';
  name.textContent = item.메뉴명;
  row.appendChild(name);

  if (isSoldOut) {
    const badge = document.createElement('span');
    badge.className = 'board__item-badge';
    badge.textContent = '품절';
    row.appendChild(badge);
  }

  const leader = document.createElement('span');
  leader.className = 'board__item-leader';
  row.appendChild(leader);

  const price = document.createElement('span');
  price.className = 'board__item-price';
  price.textContent = formatPrice(item.가격);
  row.appendChild(price);

  wrap.appendChild(row);

  if (item.설명) {
    const desc = document.createElement('div');
    desc.className = 'board__item-desc';
    desc.textContent = item.설명;
    wrap.appendChild(desc);
  }

  return wrap;
}

function renderTabs(data, activeIndex) {
  const titles = listPageTitles(data.pages);
  sheetTabsEl.replaceChildren(
    ...titles.map((title, index) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'board__tab' + (index === activeIndex ? ' board__tab--active' : '');
      tab.textContent = title;
      tab.addEventListener('click', () => {
        currentPageIndex = findPageIndexByTitle(data.pages, title);
        renderPage(currentData, currentPageIndex);
      });
      return tab;
    }),
  );
}

function renderPage(data, pageIndex) {
  const themeName = THEMES[data.테마] ? data.테마 : DEFAULT_THEME;
  const theme = THEMES[themeName];
  const device = data.디바이스 || DEFAULT_DEVICE;

  boardEl.dataset.device = device;
  boardEl.style.setProperty('--text', theme.text);
  boardEl.style.setProperty('--sub', theme.sub);
  boardEl.style.setProperty('--accent', theme.accent);
  boardEl.style.setProperty('--bg-url', `url("/assets/${themeName}/bg-${device}.png")`);
  boardEl.style.setProperty('--frame-url', `url("/assets/${themeName}/frame-${device}.png")`);

  eyebrowEl.textContent = data.영문태그 || '';
  storeEl.textContent = data.매장명 || '';

  const page = data.pages[pageIndex];
  if (!page) return;

  renderTabs(data, pageIndex);

  const categories = [...new Set(page.items.map((item) => item.카테고리).filter(Boolean))];
  sheetMetaEl.textContent = categories.join(' · ');

  itemListEl.replaceChildren(...page.items.map(renderItem));
}

function scheduleRotation(data) {
  clearInterval(rotateTimer);
  rotateTimer = null;

  if (data.자동전환초 > 0 && data.pages.length > 1) {
    rotateTimer = setInterval(() => {
      currentPageIndex = (currentPageIndex + 1) % data.pages.length;
      renderPage(currentData, currentPageIndex);
    }, data.자동전환초 * 1000);
  }
}

function render(data) {
  currentData = data;
  if (currentPageIndex >= data.pages.length) {
    currentPageIndex = 0;
  }
  renderPage(data, currentPageIndex);
  scheduleRotation(data);
}

async function loadMenu() {
  const response = await fetch('/api/menu');
  render(await response.json());
}

const events = new EventSource('/api/events');
events.addEventListener('menu-updated', (event) => {
  render(JSON.parse(event.data));
});

loadMenu();
