import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type AuthChangeCallback = (user: User | null) => void;

const listeners: AuthChangeCallback[] = [];
let cachedUser: User | null = null;
let initialSessionReady: Promise<void>;

export function onAuthChange(callback: AuthChangeCallback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(user: User | null) {
  cachedUser = user;
  listeners.forEach(cb => cb(user));
}

initialSessionReady = supabase.auth.getSession().then(({ data }) => {
  cachedUser = data.session?.user ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  notifyListeners(session?.user ?? null);
});

export async function getCurrentUser(): Promise<User | null> {
  await initialSessionReady;
  return cachedUser;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
