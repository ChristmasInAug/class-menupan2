import { THEME_KEYS, DEVICE_KEYS } from './catalog.mjs';

export function validateSettingsUpdate(settings) {
  if (!THEME_KEYS.includes(settings.테마)) {
    throw new Error(`알 수 없는 테마입니다: ${settings.테마}`);
  }
  if (!DEVICE_KEYS.includes(settings.디바이스)) {
    throw new Error(`알 수 없는 디바이스입니다: ${settings.디바이스}`);
  }
}
