const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

export function verifyCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
