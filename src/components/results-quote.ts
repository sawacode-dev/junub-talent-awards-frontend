import type { Settings } from '../api';
import { escapeHtml } from './leaderboard-row';

const QUOTE_TEXT =
  'Success is not final, failure is not fatal: it is the courage to continue that counts.';
const QUOTE_AUTHOR = 'Winston Churchill';

export function isVotingOpen(settings: Settings | null): boolean {
  if (!settings || !settings.election_end) return true;
  return new Date(settings.election_end).getTime() > Date.now();
}

export function renderQuote(): string {
  return `
    <blockquote class="results-quote">
      <p class="results-quote__text">${escapeHtml(QUOTE_TEXT)}</p>
      <cite class="results-quote__author">— ${escapeHtml(QUOTE_AUTHOR)}</cite>
    </blockquote>
  `;
}

export function appendQuoteIfOpen(container: HTMLElement, settings: Settings | null) {
  if (!isVotingOpen(settings)) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = renderQuote();
  const el = wrap.firstElementChild as HTMLElement | null;
  if (el) container.appendChild(el);
}
