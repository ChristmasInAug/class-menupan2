import crypto from 'node:crypto';

export function createSessionStore() {
  const tokens = new Set();
  return {
    create() {
      const token = crypto.randomBytes(24).toString('hex');
      tokens.add(token);
      return token;
    },
    verify(token) {
      return Boolean(token) && tokens.has(token);
    },
    revoke(token) {
      tokens.delete(token);
    },
  };
}
