import type { Candidate } from '../api';

export interface RankedCandidate extends Candidate {
  rankInCategory: number;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function rankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function fallbackAvatarUrl(name: string, size = 200): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=${size}`;
}

export function renderLeaderboardRow(c: RankedCandidate, leaderVotes: number): string {
  const pct = leaderVotes > 0 ? (c.vote_count / leaderVotes) * 100 : 0;
  const fb = fallbackAvatarUrl(c.name, 200);
  const safeName = escapeHtml(c.name);
  return `
    <div class="leaderboard__row ${c.rankInCategory <= 3 ? 'leaderboard__row--top' : ''}" style="animation-delay: ${(c.rankInCategory - 1) * 0.04}s">
      <span class="leaderboard__rank">${rankBadge(c.rankInCategory)}</span>
      <img class="leaderboard__avatar" src="${c.image_url || fb}" alt="${safeName}" loading="lazy" onerror="this.onerror=null;this.src='${fb}';" />
      <div class="leaderboard__info">
        <span class="leaderboard__name">${safeName}</span>
        <div class="leaderboard__bar-wrapper">
          <div class="leaderboard__bar" style="width: ${pct}%"></div>
        </div>
      </div>
      <span class="leaderboard__votes">${c.vote_count.toLocaleString()}</span>
    </div>
  `;
}
