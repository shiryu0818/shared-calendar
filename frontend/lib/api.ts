const BASE_URL = 'http://localhost:4000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API request failed');
  }
  return res.json();
}

export function login(data: { username: string; password: string }) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export function registerUser(data: { name: string; username: string; email?: string; password: string }) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request('/auth/me');
}

export function getCalendars() {
  return request('/calendars');
}

export function getEvents(calendarId: string, month: string) {
  return request(`/events/calendar/${calendarId}?month=${month}`);
}

export function createEvent(data: any) {
  return request('/events', { method: 'POST', body: JSON.stringify(data) });
}
