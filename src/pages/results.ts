import { fetchLeaderboard } from '../api';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';

export async function renderResultsPage(container: HTMLElement) {
  showPageLoader(container);

  try {
    const leaders = await fetchLeaderboard();

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
      <p class="page-header__subtitle">Real-time leaderboard across all categories</p>
    `;
    container.appendChild(pageHeader);
    pageHeader.querySelector('#back-btn')?.addEventListener('click', () => navigate('/'));

    if (leaders.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <span class="empty-state__icon">🗳️</span>
        <h2>No votes yet</h2>
        <p>Be the first to vote!</p>
      `;
      container.appendChild(empty);
      return;
    }

    const maxVotes = leaders[0]?.vote_count || 1;

    const leaderboard = document.createElement('div');
    leaderboard.className = 'leaderboard';

    leaders.forEach((candidate, index) => {
      const percentage = maxVotes > 0 ? (candidate.vote_count / maxVotes) * 100 : 0;
      const rank = index + 1;

      const row = document.createElement('div');
      row.className = `leaderboard__row ${rank <= 3 ? 'leaderboard__row--top' : ''}`;
      row.style.animationDelay = `${index * 0.05}s`;

      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=7c3aed&color=fff&size=200`;
      row.innerHTML = `
        <span class="leaderboard__rank">${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}</span>
        <img class="leaderboard__avatar" src="${candidate.image_url || fallbackAvatar}" alt="${candidate.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackAvatar}';" />
        <div class="leaderboard__info">
          <span class="leaderboard__name">${candidate.name}</span>
          <span class="leaderboard__category">${candidate.category_name}</span>
          <div class="leaderboard__bar-wrapper">
            <div class="leaderboard__bar" style="width: ${percentage}%"></div>
          </div>
        </div>
        <span class="leaderboard__votes">${candidate.vote_count.toLocaleString()}</span>
      `;
      leaderboard.appendChild(row);
    });

    container.appendChild(leaderboard);
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
