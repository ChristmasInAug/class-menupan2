import { THEMES, DEVICES } from '/lib/catalog.mjs';

const loginView = document.getElementById('login-view');
const settingsView = document.getElementById('settings-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const settingsForm = document.getElementById('settings-form');
const saveStatus = document.getElementById('save-status');
const themeOptions = document.getElementById('theme-options');
const deviceOptions = document.getElementById('device-options');
const logoutButton = document.getElementById('logout-button');

let selectedTheme = null;
let selectedDevice = null;

function renderOptionButtons(container, entries, selectedKey, onSelect) {
  container.replaceChildren(
    ...entries.map(({ key, label }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(key === selectedKey));
      button.addEventListener('click', () => onSelect(key));
      return button;
    }),
  );
}

function renderThemeOptions() {
  renderOptionButtons(themeOptions, THEMES, selectedTheme, (key) => {
    selectedTheme = key;
    renderThemeOptions();
  });
}

function renderDeviceOptions() {
  renderOptionButtons(deviceOptions, DEVICES, selectedDevice, (key) => {
    selectedDevice = key;
    renderDeviceOptions();
  });
}

function showLogin(message) {
  loginView.hidden = false;
  settingsView.hidden = true;
  if (message) {
    loginError.textContent = message;
    loginError.hidden = false;
  } else {
    loginError.hidden = true;
  }
}

function showSettings(settings) {
  loginView.hidden = true;
  settingsView.hidden = false;

  selectedTheme = settings.테마;
  selectedDevice = settings.디바이스;
  settingsForm.elements['매장명'].value = settings.매장명 ?? '';
  settingsForm.elements['영문태그'].value = settings.영문태그 ?? '';
  settingsForm.elements['자동전환초'].value = settings.자동전환초 ?? 0;

  renderThemeOptions();
  renderDeviceOptions();
}

async function loadSettings() {
  const response = await fetch('/admin/api/settings');
  if (response.status === 401) {
    showLogin();
    return;
  }
  showSettings(await response.json());
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const response = await fetch('/admin/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: formData.get('username'),
      password: formData.get('password'),
    }),
  });

  if (!response.ok) {
    showLogin('아이디 또는 비밀번호가 올바르지 않습니다.');
    return;
  }
  loadSettings();
});

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(settingsForm);
  const settings = {
    매장명: formData.get('매장명'),
    테마: selectedTheme,
    디바이스: selectedDevice,
    영문태그: formData.get('영문태그'),
    자동전환초: Number(formData.get('자동전환초')),
  };

  const response = await fetch('/admin/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  const result = await response.json();
  saveStatus.hidden = false;
  if (response.ok) {
    saveStatus.textContent = '저장했습니다. 화면에 곧 반영됩니다.';
    saveStatus.className = 'status status--ok';
    showSettings(result);
  } else {
    saveStatus.textContent = result.error ?? '저장에 실패했습니다.';
    saveStatus.className = 'status status--error';
  }
});

logoutButton.addEventListener('click', async () => {
  await fetch('/admin/api/logout', { method: 'POST' });
  showLogin();
});

loadSettings();
