import { supabase } from './supabase';
import { fetchSettings } from './api';
import type { Settings } from './api';

export interface CeremonyState {
  votingNotStarted: boolean;
  votingOpen: boolean;
  votingClosed: boolean;
  resultsRevealed: boolean;
  revealedAt: string | null;
  electionStart: string | null;
  electionEnd: string | null;
}

let cachedSettings: Settings | null = null;
let cachedAt = 0;
const CACHE_MS = 15_000;
const SETTINGS_CHANGE_EVENT = 'jta:settings-change';

export function deriveCeremonyState(settings: Settings | null): CeremonyState {
  const now = Date.now();
  const start = settings?.election_start ? new Date(settings.election_start).getTime() : null;
  const end = settings?.election_end ? new Date(settings.election_end).getTime() : null;

  const paused = settings?.is_paused ?? false;
  const votingNotStarted = start !== null && now < start;
  const votingOpen = !paused && (start === null || now >= start) && (end === null || now <= end);
  const votingClosed = paused || (end !== null && now > end);

  return {
    votingNotStarted,
    votingOpen,
    votingClosed,
    resultsRevealed: settings?.results_revealed ?? false,
    revealedAt: settings?.revealed_at ?? null,
    electionStart: settings?.election_start ?? null,
    electionEnd: settings?.election_end ?? null,
  };
}

export async function getCeremonyState(forceRefresh = false): Promise<CeremonyState> {
  if (!forceRefresh && cachedSettings && Date.now() - cachedAt < CACHE_MS) {
    return deriveCeremonyState(cachedSettings);
  }
  const settings = await fetchSettings();
  cachedSettings = settings;
  cachedAt = Date.now();
  return deriveCeremonyState(settings);
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('is_admin rpc failed', error);
    return false;
  }
  return Boolean(data);
}

export async function canViewResults(): Promise<boolean> {
  const state = await getCeremonyState();
  if (state.resultsRevealed) return true;
  if (state.votingClosed && (await isAdmin())) return true;
  return false;
}

export function onSettingsChange(callback: (settings: Settings) => void): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<Settings>).detail;
    if (detail) callback(detail);
  };
  window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
  return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
}

let realtimeStarted = false;
export function startSettingsRealtime(): void {
  if (realtimeStarted) return;
  realtimeStarted = true;
  supabase
    .channel('settings-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings' },
      (payload) => {
        const next = (payload.new ?? payload.old) as Settings | null;
        if (!next) return;
        cachedSettings = next;
        cachedAt = Date.now();
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: next }));
      },
    )
    .subscribe();
}
