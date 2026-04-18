import {
  fetchCategories,
  fetchCandidates,
  fetchUserVotes,
  fetchSettings,
} from '../api';
import type { Candidate, Category, Vote, Settings } from '../api';
import { getCurrentUser } from '../auth';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';

interface RankedCandidate extends Candidate {
  rankInCategory: number;
}

interface CategoryGroup {
  category: Category;
  candidates: RankedCandidate[];
  leaderVotes: number;
}

const QUOTE_TEXT =
  'Success is not final, failure is not fatal: it is the courage to continue that counts.';
const QUOTE_AUTHOR = 'Winston Churchill';

function isVotingOpen(settings: Settings | null): boolean {
  if (!settings || !settings.election_end) return true;
  return new Date(settings.election_end).getTime() > Date.now();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function fallbackAvatarUrl(name: string, size = 200): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=${size}`;
}

function renderRow(c: RankedCandidate, leaderVotes: number): string {
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

function renderCategorySection(group: CategoryGroup, isActive: boolean, isMobileOpen: boolean): string {
  const { category, candidates, leaderVotes } = group;
  const icon = category.icon || '🏆';
  const safeName = escapeHtml(category.name);

  const body = candidates.length === 0
    ? `<div class="results-empty">No candidates yet in this category.</div>`
    : candidates.map(c => renderRow(c, leaderVotes)).join('');

  return `
    <section
      class="results-section ${isActive ? 'results-section--active' : ''}"
      data-category-id="${category.id}"
    >
      <button
        class="results-section__header"
        type="button"
        aria-expanded="${isMobileOpen ? 'true' : 'false'}"
        aria-controls="results-body-${category.id}"
      >
        <span class="results-section__icon">${icon}</span>
        <span class="results-section__title">${safeName}</span>
        <span class="results-section__count">${candidates.length}</span>
        <svg class="results-section__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div
        class="results-section__body ${isMobileOpen ? 'results-section__body--open' : ''}"
        id="results-body-${category.id}"
      >
        <div class="leaderboard">
          ${body}
        </div>
      </div>
    </section>
  `;
}

function renderTabs(groups: CategoryGroup[], activeId: string): string {
  return `
    <nav class="results-tabs" role="tablist" aria-label="Categories">
      ${groups.map(g => `
        <button
          class="results-tabs__tab ${g.category.id === activeId ? 'results-tabs__tab--active' : ''}"
          role="tab"
          aria-selected="${g.category.id === activeId ? 'true' : 'false'}"
          data-category-id="${g.category.id}"
          type="button"
        >
          <span class="results-tabs__icon">${g.category.icon || '🏆'}</span>
          <span class="results-tabs__label">${escapeHtml(g.category.name)}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function renderYourVotes(
  votes: Vote[],
  candidateIndex: Map<string, RankedCandidate>,
  categoryIndex: Map<string, Category>
): string {
  const items = votes
    .map(v => {
      const c = candidateIndex.get(v.candidate_id);
      const cat = categoryIndex.get(v.category_id);
      if (!c || !cat) return null;
      const fb = fallbackAvatarUrl(c.name, 80);
      return `
        <li class="your-votes__item">
          <img class="your-votes__avatar" src="${c.image_url || fb}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fb}';" />
          <div class="your-votes__info">
            <span class="your-votes__name">${escapeHtml(c.name)}</span>
            <span class="your-votes__category">${escapeHtml(cat.name)}</span>
          </div>
          <div class="your-votes__meta">
            <span class="your-votes__rank">${rankBadge(c.rankInCategory)}</span>
            <span class="your-votes__votes">${c.vote_count.toLocaleString()} votes</span>
          </div>
        </li>
      `;
    })
    .filter(Boolean)
    .join('');

  if (!items) return '';

  return `
    <section class="your-votes" aria-labelledby="your-votes-title">
      <h2 class="your-votes__title" id="your-votes-title">Your Votes</h2>
      <ul class="your-votes__list">${items}</ul>
    </section>
  `;
}

function renderQuote(): string {
  return `
    <blockquote class="results-quote">
      <p class="results-quote__text">${escapeHtml(QUOTE_TEXT)}</p>
      <cite class="results-quote__author">— ${escapeHtml(QUOTE_AUTHOR)}</cite>
    </blockquote>
  `;
}

export async function renderResultsPage(container: HTMLElement) {
  showPageLoader(container);

  try {
    const user = await getCurrentUser();
    const [categories, settings, userVotes] = await Promise.all([
      fetchCategories(),
      fetchSettings(),
      user ? fetchUserVotes() : Promise.resolve([] as Vote[]),
    ]);

    const candidateLists = await Promise.all(
      categories.map(c => fetchCandidates(c.id))
    );

    const groups: CategoryGroup[] = categories.map((category, i) => {
      const sorted = [...candidateLists[i]].sort((a, b) => b.vote_count - a.vote_count);
      const ranked: RankedCandidate[] = sorted.map((c, idx) => ({ ...c, rankInCategory: idx + 1 }));
      const leaderVotes = ranked[0]?.vote_count ?? 0;
      return { category, candidates: ranked, leaderVotes };
    });

    const candidateIndex = new Map<string, RankedCandidate>();
    const categoryIndex = new Map<string, Category>();
    groups.forEach(g => {
      categoryIndex.set(g.category.id, g.category);
      g.candidates.forEach(c => candidateIndex.set(c.id, c));
    });

    const userVoteCategoryIds = new Set(userVotes.map(v => v.category_id));
    const categoryVoteCount = new Map<string, number>();
    userVotes.forEach(v => {
      categoryVoteCount.set(v.category_id, (categoryVoteCount.get(v.category_id) ?? 0) + 1);
    });

    let defaultCategoryId = groups[0]?.category.id ?? '';
    if (categoryVoteCount.size > 0) {
      let maxVotes = 0;
      categoryVoteCount.forEach((count, catId) => {
        if (count > maxVotes && groups.some(g => g.category.id === catId)) {
          maxVotes = count;
          defaultCategoryId = catId;
        }
      });
    }

    container.innerHTML = '';

    const pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = `
      <button class="page-header__back" id="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <div class="page-header__title-group">
        <span class="page-header__icon">📊</span>
        <h1 class="page-header__title">Live Results</h1>
      </div>
      <p class="page-header__subtitle">Per-category leaderboards across the awards</p>
    `;
    container.appendChild(pageHeader);
    pageHeader.querySelector('#back-btn')?.addEventListener('click', () => navigate('/'));

    if (isVotingOpen(settings)) {
      const quoteWrap = document.createElement('div');
      quoteWrap.innerHTML = renderQuote();
      container.appendChild(quoteWrap.firstElementChild as HTMLElement);
    }

    if (user && userVotes.length > 0) {
      const yvWrap = document.createElement('div');
      yvWrap.innerHTML = renderYourVotes(userVotes, candidateIndex, categoryIndex);
      const yvEl = yvWrap.firstElementChild as HTMLElement | null;
      if (yvEl) container.appendChild(yvEl);
    }

    if (groups.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <span class="empty-state__icon">🗳️</span>
        <h2>No categories yet</h2>
        <p>Check back soon!</p>
      `;
      container.appendChild(empty);
      return;
    }

    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'results-tabs-wrap';
    tabsWrap.innerHTML = renderTabs(groups, defaultCategoryId);
    container.appendChild(tabsWrap);

    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'results-sections';
    sectionsWrap.innerHTML = groups
      .map(g => {
        const isActive = g.category.id === defaultCategoryId;
        const isMobileOpen = userVoteCategoryIds.has(g.category.id) || isActive;
        return renderCategorySection(g, isActive, isMobileOpen);
      })
      .join('');
    container.appendChild(sectionsWrap);

    sectionsWrap.querySelectorAll<HTMLButtonElement>('.results-section__header').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.closest<HTMLElement>('.results-section');
        const body = section?.querySelector<HTMLElement>('.results-section__body');
        if (!section || !body) return;
        const open = body.classList.toggle('results-section__body--open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    tabsWrap.querySelectorAll<HTMLButtonElement>('.results-tabs__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.categoryId;
        if (!id) return;
        tabsWrap.querySelectorAll('.results-tabs__tab').forEach(t => {
          const active = t === tab;
          t.classList.toggle('results-tabs__tab--active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        sectionsWrap.querySelectorAll<HTMLElement>('.results-section').forEach(sec => {
          sec.classList.toggle('results-section--active', sec.dataset.categoryId === id);
        });
      });
    });
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
