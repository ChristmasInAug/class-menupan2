export const THEMES = [
  { key: 'light-olive', label: 'Light Olive', ko: '라이트 올리브' },
  { key: 'deep-green', label: 'Deep Green', ko: '딥 그린' },
  { key: 'cream', label: 'Cream', ko: '크림' },
  { key: 'beige', label: 'Beige', ko: '베이지' },
  { key: 'cafe-dark', label: 'Cafe Dark', ko: '카페 다크' },
  { key: 'bistro-light', label: 'Bistro Light', ko: '비스트로 라이트' },
  { key: 'forest-dark', label: 'Forest Dark', ko: '포레스트 다크' },
  { key: 'forest-light', label: 'Forest Light', ko: '포레스트 라이트' },
];

export const DEVICES = [
  { key: 'signage', label: '사이니지 (세로)', w: 1080, h: 1920 },
  { key: 'tablet-land', label: '태블릿 (가로)', w: 1920, h: 1440 },
  { key: 'tablet-port', label: '태블릿 (세로)', w: 1440, h: 1920 },
  { key: 'mobile', label: '모바일', w: 1080, h: 2160 },
];

export const THEME_KEYS = THEMES.map((t) => t.key);
export const DEVICE_KEYS = DEVICES.map((d) => d.key);
