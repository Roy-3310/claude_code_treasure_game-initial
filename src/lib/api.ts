const getToken = () => localStorage.getItem('token');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export function signup(username: string, password: string) {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function signin(username: string, password: string) {
  return request<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function saveScore(score: number) {
  return request<{ ok: boolean }>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ score }),
  });
}
