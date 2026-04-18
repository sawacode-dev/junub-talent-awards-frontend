import {
  fetchCategories,
  fetchCandidates,
  fetchUserVotes,
  fetchSettings,
} from '../api';
import type { Candidate, Category, Vote } from '../api';
import { getCurrentUser } from '../auth';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';
import {
  escapeHtml,
  fallbackAvatarUrl,
  renderLeaderboardRow,
  type RankedCandidate,
} from '../components/leaderboard-row';
import { appendQuoteIfOpen, isVotingOpen } from '../components/results-quote';
import { setMeta, siteUrl, eventYear } from '../seo';
import { renderCategoryIcon } from '../components/category-icon';
import { canViewResults } from '../ceremony';

const TOP_N = 3;

interface CategoryGroup {
  category: Category;
  candidates: RankedCandidate[];
  leaderVotes: number;
  totalCandidates: number;
}

function renderCategorySection(group: CategoryGroup, isActive: boolean, isMobileOpen: boolean, showCounts: boolean): string {
  const { category, candidates, leaderVotes, totalCandidates } = group;
  const icon = renderCategoryIcon(category);
  const safeName = escapeHtml(category.name);

  const top = candidates.slice(0, TOP_N);
  const body = top.length === 0
    ? `<div class="results-empty">No candidates yet in this category.</div>`
    : top.map(c => renderLeaderboardRow(c, leaderVotes, showCounts)).join('');

  const viewAll = totalCandidates > TOP_N
    ? `<a class="results-viewall" href="/results/${encodeURIComponent(category.slug)}">View all ${totalCandidates} in ${safeName} →</a>`
    : '';

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
        <span class="results-section__count">${totalCandidates}</span>
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
        ${viewAll}
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
          <span class="results-tabs__icon">${renderCategoryIcon(g.category)}</span>
          <span class="results-tabs__label">${escapeHtml(g.category.name)}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function renderGlimpse(
  votes: Vote[],
  candidateIndex: Map<string, Candidate>
): string {
  if (votes.length === 0) return '';
  const categoryCount = new Set(votes.map(v => v.category_id)).size;
  const recentVotes = [...votes]
    .sort((a, b) => new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime())
    .slice(0, 3);
  const avatars = recentVotes
    .map(v => {
      const c = candidateIndex.get(v.candidate_id);
      if (!c) return '';
      const fb = fallbackAvatarUrl(c.name, 80);
      return `<img class="glimpse__avatar" src="${c.image_url || fb}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fb}';" />`;
    })
    .join('');

  return `
    <a class="glimpse" href="/profile">
      <div class="glimpse__avatars">${avatars}</div>
      <div class="glimpse__text">
        <strong>You've voted for ${votes.length} candidate${votes.length === 1 ? '' : 's'}</strong>
        <span>across ${categoryCount} categor${categoryCount === 1 ? 'y' : 'ies'}</span>
      </div>
      <span class="glimpse__cta">View your votes →</span>
    </a>
  `;
}

export async function renderResultsPage(container: HTMLElement) {
  showPageLoader(container);

  if (!(await canViewResults())) {
    navigate('/');
    return;
  }

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

    const year = eventYear(settings?.election_end);
    const canonical = siteUrl('/results');
    setMeta({
      title: `Live Results — Junub Talent Awards ${year}`,
      description: `Live per-category leaderboards for the Junub Talent Awards ${year}. See which Junubins are leading across art, dance, drama, and creative arts.`,
      canonical,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Live Results', item: siteUrl('/results') },
          ],
        },
      ],
    });

    const groups: CategoryGroup[] = categories.map((category, i) => {
      const sorted = [...candidateLists[i]].sort((a, b) => b.vote_count - a.vote_count);
      const ranked: RankedCandidate[] = sorted.map((c, idx) => ({ ...c, rankInCategory: idx + 1 }));
      const leaderVotes = ranked[0]?.vote_count ?? 0;
      return {
        category,
        candidates: ranked,
        leaderVotes,
        totalCandidates: ranked.length,
      };
    });

    const candidateIndex = new Map<string, RankedCandidate>();
    groups.forEach(g => g.candidates.forEach(c => candidateIndex.set(c.id, c)));

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

    appendQuoteIfOpen(container, settings);

    if (user && userVotes.length > 0) {
      const wrap = document.createElement('div');
      wrap.innerHTML = renderGlimpse(userVotes, candidateIndex);
      const el = wrap.firstElementChild as HTMLElement | null;
      if (el) container.appendChild(el);
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

    const showCounts = !isVotingOpen(settings);
    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'results-sections';
    sectionsWrap.innerHTML = groups
      .map(g => {
        const isActive = g.category.id === defaultCategoryId;
        const isMobileOpen = userVoteCategoryIds.has(g.category.id) || isActive;
        return renderCategorySection(g, isActive, isMobileOpen, showCounts);
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
