import { fetchCategories, fetchCandidates, fetchSettings } from '../api';
import type { Category } from '../api';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';
import {
  escapeHtml,
  renderLeaderboardRow,
  type RankedCandidate,
} from '../components/leaderboard-row';
import { appendQuoteIfOpen } from '../components/results-quote';

export async function renderResultsCategoryPage(container: HTMLElement, slug: string) {
  showPageLoader(container);

  try {
    const [categories, settings] = await Promise.all([
      fetchCategories(),
      fetchSettings(),
    ]);

    const category = categories.find((c: Category) => c.slug === slug);
    if (!category) {
      container.innerHTML = `
        <div class="error-state">
          <span class="error-state__icon">🔍</span>
          <h2>Category not found</h2>
          <p>The category "${escapeHtml(slug)}" doesn't exist.</p>
          <button class="btn btn--primary" id="back-results-btn">Back to Results</button>
        </div>
      `;
      container.querySelector('#back-results-btn')?.addEventListener('click', () => navigate('/results'));
      return;
    }

    const candidates = await fetchCandidates(category.id);
    const sorted = [...candidates].sort((a, b) => b.vote_count - a.vote_count);
    const ranked: RankedCandidate[] = sorted.map((c, i) => ({ ...c, rankInCategory: i + 1 }));
    const leaderVotes = ranked[0]?.vote_count ?? 0;

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <button class="page-header__back" id="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Results
      </button>
      <div class="page-header__title-group">
        <span class="page-header__icon">${category.icon || '🏆'}</span>
        <h1 class="page-header__title">${escapeHtml(category.name)} — Full Leaderboard</h1>
      </div>
      <p class="page-header__subtitle">All ${ranked.length} candidate${ranked.length === 1 ? '' : 's'}, ranked by votes</p>
    `;
    container.appendChild(header);
    header.querySelector('#back-btn')?.addEventListener('click', () => navigate('/results'));

    appendQuoteIfOpen(container, settings);

    if (ranked.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <span class="empty-state__icon">📭</span>
        <h2>No candidates yet</h2>
        <p>Be the first to vote!</p>
      `;
      container.appendChild(empty);
      return;
    }

    const board = document.createElement('div');
    board.className = 'leaderboard';
    board.innerHTML = ranked.map(c => renderLeaderboardRow(c, leaderVotes)).join('');
    container.appendChild(board);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <span class="error-state__icon">⚠️</span>
        <h2>Could not load results</h2>
        <p>Please try again later.</p>
        <button class="btn btn--primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    console.error(err);
  }
}
