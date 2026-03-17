import { useState } from 'react';
import * as api from '@/lib/api';

interface User {
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    return username && token ? { username } : null;
  });
  const [isGuest, setIsGuest] = useState(false);

  async function signIn(username: string, password: string) {
    const res = await api.signin(username, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    setUser({ username: res.username });
  }

  async function signUp(username: string, password: string) {
    const res = await api.signup(username, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    setUser({ username: res.username });
  }

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setIsGuest(false);
  }

  function continueAsGuest() {
    setIsGuest(true);
  }

  return { user, isGuest, signIn, signUp, signOut, continueAsGuest };
}
