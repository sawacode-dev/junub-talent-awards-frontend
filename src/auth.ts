import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type AuthChangeCallback = (user: User | null) => void;

const listeners: AuthChangeCallback[] = [];

export function onAuthChange(callback: AuthChangeCallback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(user: User | null) {
  listeners.forEach(cb => cb(user));
}

// Initialize auth state listener
supabase.auth.onAuthStateChange((_event, session) => {
  notifyListeners(session?.user ?? null);
});

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href, // redirect back to the contextual page
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
