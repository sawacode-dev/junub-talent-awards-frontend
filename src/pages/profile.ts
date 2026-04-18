import { fetchCategories, fetchCandidates, fetchUserVotes } from '../api';
import type { Category, Vote } from '../api';
import { getCurrentUser, signInWithGoogle } from '../auth';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';
import {
  escapeHtml,
  fallbackAvatarUrl,
  rankBadge,
  type RankedCandidate,
} from '../components/leaderboard-row';

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  if (diff < 0) return 'just now';
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `voted ${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `voted ${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(diff / day);
  if (d < 7) return `voted ${d} day${d === 1 ? '' : 's'} ago`;
  return `voted on ${new Date(iso).toLocaleDateString()}`;
}

interface VoteRow {
  vote: Vote;
  candidate: RankedCandidate;
}

interface ProfileGroup {
  category: Category;
  rows: VoteRow[];
}

function renderVoteRow(row: VoteRow, categorySlug: string): string {
  const { vote, candidate } = row;
  const fb = fallbackAvatarUrl(candidate.name, 200);
  const safeName = escapeHtml(candidate.name);
  return `
    <a class="profile-vote" href="#/results/${encodeURIComponent(categorySlug)}">
      <img class="profile-vote__avatar" src="${candidate.image_url || fb}" alt="${safeName}" loading="lazy" onerror="this.onerror=null;this.src='${fb}';" />
      <div class="profile-vote__info">
        <span class="profile-vote__name">${safeName}</span>
        <span class="profile-vote__when">${escapeHtml(relativeTime(vote.voted_at))}</span>
      </div>
      <div class="profile-vote__meta">
        <span class="profile-vote__rank">${rankBadge(candidate.rankInCategory)}</span>
        <span class="profile-vote__votes">${candidate.vote_count.toLocaleString()} votes</span>
      </div>
    </a>
  `;
}

function renderGroup(group: ProfileGroup, isOpen: boolean): string {
  const { category, rows } = group;
  const safeName = escapeHtml(category.name);
  return `
    <section class="results-section ${isOpen ? 'results-section--active' : ''}" data-category-id="${category.id}">
      <button
        class="results-section__header"
        type="button"
        aria-expanded="${isOpen ? 'true' : 'false'}"
        aria-controls="profile-body-${category.id}"
      >
        <span class="results-section__icon">${category.icon || '🏆'}</span>
        <span class="results-section__title">${safeName}</span>
        <span class="results-section__count">${rows.length}</span>
        <a class="results-section__link" href="#/results/${encodeURIComponent(category.slug)}" onclick="event.stopPropagation()">View leaderboard →</a>
        <svg class="results-section__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div
        class="results-section__body ${isOpen ? 'results-section__body--open' : ''}"
        id="profile-body-${category.id}"
      >
        <div class="profile-votes-list">
          ${rows.map(r => renderVoteRow(r, category.slug)).join('')}
        </div>
      </div>
    </section>
  `;
}

export async function renderProfilePage(container: HTMLElement) {
  showPageLoader(container);

  try {
    const user = await getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <div class="error-state">
          <span class="error-state__icon">🔒</span>
          <h2>Sign in to see your profile</h2>
          <p>Your votes and profile details live here.</p>
          <button class="btn btn--primary" id="profile-signin-btn">Sign in with Google</button>
        </div>
      `;
      container.querySelector('#profile-signin-btn')?.addEventListener('click', async () => {
        try {
          await signInWithGoogle();
        } catch (err) {
          console.error(err);
        }
      });
      return;
    }

    const [categories, userVotes] = await Promise.all([
      fetchCategories(),
      fetchUserVotes(),
    ]);

    const votedCategoryIds = new Set(userVotes.map(v => v.category_id));
    const relevantCategories = categories.filter(c => votedCategoryIds.has(c.id));

    const candidatesByCategory = await Promise.all(
      relevantCategories.map(c => fetchCandidates(c.id))
    );

    const candidateIndex = new Map<string, RankedCandidate>();
    candidatesByCategory.forEach((list) => {
      const sorted = [...list].sort((a, b) => b.vote_count - a.vote_count);
      sorted.forEach((c, idx) => {
        candidateIndex.set(c.id, { ...c, rankInCategory: idx + 1 });
      });
    });

    const groups: ProfileGroup[] = relevantCategories
      .map(category => {
        const rows: VoteRow[] = userVotes
          .filter(v => v.category_id === category.id)
          .map(v => {
            const c = candidateIndex.get(v.candidate_id);
            return c ? { vote: v, candidate: c } : null;
          })
          .filter((x): x is VoteRow => x !== null)
          .sort((a, b) => new Date(b.vote.voted_at).getTime() - new Date(a.vote.voted_at).getTime());
        return { category, rows };
      })
      .filter(g => g.rows.length > 0);

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'page-header';
    const displayName = user.user_metadata?.full_name || user.email || 'Voter';
    header.innerHTML = `
      <button class="page-header__back" id="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <div class="page-header__title-group">
        <span class="page-header__icon">👤</span>
        <h1 class="page-header__title">${escapeHtml(displayName)}</h1>
      </div>
      <p class="page-header__subtitle">${escapeHtml(user.email || '')}</p>
    `;
    container.appendChild(header);
    header.querySelector('#back-btn')?.addEventListener('click', () => navigate('/'));

    const section = document.createElement('section');
    section.className = 'profile-votes';

    if (groups.length === 0) {
      section.innerHTML = `
        <h2 class="profile-votes__title">Your Votes</h2>
        <div class="empty-state" style="padding: var(--space-xl) 0;">
          <span class="empty-state__icon">🗳️</span>
          <h2>No votes yet</h2>
          <p>Cast your first vote from the categories on the home page.</p>
          <button class="btn btn--primary" id="profile-go-home">Browse categories</button>
        </div>
      `;
      container.appendChild(section);
      section.querySelector('#profile-go-home')?.addEventListener('click', () => navigate('/'));
      return;
    }

    const totalVotes = groups.reduce((sum, g) => sum + g.rows.length, 0);
    section.innerHTML = `
      <h2 class="profile-votes__title">Your Votes</h2>
      <p class="profile-votes__summary">${totalVotes} vote${totalVotes === 1 ? '' : 's'} across ${groups.length} categor${groups.length === 1 ? 'y' : 'ies'}</p>
    `;

    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'results-sections';
    sectionsWrap.innerHTML = groups.map((g, i) => renderGroup(g, i === 0)).join('');
    section.appendChild(sectionsWrap);
    container.appendChild(section);

    sectionsWrap.querySelectorAll<HTMLButtonElement>('.results-section__header').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.results-section__link')) return;
        const sec = btn.closest<HTMLElement>('.results-section');
        const body = sec?.querySelector<HTMLElement>('.results-section__body');
        if (!sec || !body) return;
        const open = body.classList.toggle('results-section__body--open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <span class="error-state__icon">⚠️</span>
        <h2>Could not load your profile</h2>
        <p>Please try again later.</p>
        <button class="btn btn--primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    console.error(err);
  }
}
