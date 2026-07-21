const USERS_KEY = 'calendi-users';
const SESSION_KEY = 'calendi-session';

type Users = Record<string, string>;

function hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function getUsers(): Users {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
}

export function hasAnyUser(): boolean {
  return Object.keys(getUsers()).length > 0;
}

export function register(username: string, password: string): { ok: boolean; error?: string } {
  const users = getUsers();
  const key = username.toLowerCase().trim();
  if (!key || key.length < 2) return { ok: false, error: 'username must be at least 2 characters' };
  if (password.length < 4) return { ok: false, error: 'password must be at least 4 characters' };
  if (users[key]) return { ok: false, error: 'username already taken' };
  users[key] = hash(password);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, key);
  return { ok: true };
}

export function login(username: string, password: string): { ok: boolean; error?: string } {
  const users = getUsers();
  const key = username.toLowerCase().trim();
  if (!users[key] || users[key] !== hash(password)) {
    return { ok: false, error: 'incorrect username or password' };
  }
  localStorage.setItem(SESSION_KEY, key);
  return { ok: true };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}
