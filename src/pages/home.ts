import { fetchCategories, fetchGlobalStats, fetchSettings } from '../api';
import type { Category } from '../api';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';
import { setMeta, siteUrl, eventYear } from '../seo';
import { renderCategoryIcon } from '../components/category-icon';
import { deriveCeremonyState } from '../ceremony';

export async function renderHomePage(container: HTMLElement) {
  showPageLoader(container);

  try {
    const [categories, globalStats, settings] = await Promise.all([
      fetchCategories(),
      fetchGlobalStats(),
      fetchSettings()
    ]);

    const year = eventYear(settings?.election_end);
    const eventJsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `Junub Talent Awards ${year}`,
      description: 'The Junub Talent Awards celebrate outstanding South Sudanese (Junubins) talent in art, dance, drama, and creative arts.',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      url: siteUrl('/'),
      image: siteUrl('/og-image.png'),
      location: {
        '@type': 'VirtualLocation',
        url: siteUrl('/'),
      },
      organizer: {
        '@type': 'Organization',
        name: 'Junub Talent Awards',
        url: siteUrl('/'),
      },
    };
    if (settings?.election_start) eventJsonLd.startDate = settings.election_start;
    if (settings?.election_end) eventJsonLd.endDate = settings.election_end;

    setMeta({
      title: `Junub Talent Awards ${year} | Celebrating South Sudanese Talent`,
      description: 'The Junub Talent Awards (Junub means "south" in Sudani Arabic) celebrate outstanding South Sudanese talent in art, dance, drama, and creative arts. Cast your vote for the Junubins who inspire you.',
      canonical: siteUrl('/'),
      ogType: 'website',
      jsonLd: [eventJsonLd],
    });

    container.innerHTML = '';

    // Hero section
    const hero = document.createElement('section');
    hero.className = 'hero';
    
    const ceremony = deriveCeremonyState(settings);
    let countdownHtml = '';
    if (ceremony.votingClosed && !ceremony.resultsRevealed) {
      countdownHtml = `
        <div class="hero__countdown hero__countdown--ended">
          <span class="hero__countdown-label">🎤 Winners will be revealed at the awards ceremony</span>
        </div>
      `;
    } else if (ceremony.votingClosed && ceremony.resultsRevealed) {
      countdownHtml = `
        <div class="hero__countdown hero__countdown--ended">
          <span class="hero__countdown-label">🏆 Results are live — see the leaderboard</span>
        </div>
      `;
    } else if (settings && settings.election_end) {
      countdownHtml = `
        <div class="hero__countdown" id="hero-countdown">
          <span class="hero__countdown-label">Voting Closes In:</span>
          <span class="hero__countdown-value" id="deadline-timer">--:--:--</span>
        </div>
      `;
    }

    hero.innerHTML = `
      <div class="hero__content">
        ${countdownHtml}
        <h1 class="hero__title">
          Celebrate the
          <span class="hero__title-accent">Outstanding Talent</span>
        </h1>
        <p class="hero__subtitle">
          The official platform for the Junub Talent Awards. 
          Vote for the nominees who inspire you across art, dance, and drama.
        </p>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">${globalStats.categories}</span>
            <span class="hero__stat-label">Categories</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">${globalStats.candidates}</span>
            <span class="hero__stat-label">Nominees</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">24h</span>
            <span class="hero__stat-label">Vote Cycle</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(hero);

    // Initialize countdown timer
    if (settings && settings.election_end) {
      const timerEl = hero.querySelector('#deadline-timer');
      if (timerEl) {
        const endDate = new Date(settings.election_end).getTime();
        const updateTimer = () => {
          const now = new Date().getTime();
          const diff = endDate - now;
          if (diff <= 0) {
            timerEl.textContent = 'Closed';
            return;
          }
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            timerEl.textContent = `${days}d ${hours}h ${mins}m`;
          } else {
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            timerEl.textContent = `${hours}h ${mins}m ${secs}s`;
          }
        };
        updateTimer();
        setInterval(updateTimer, 1000);
      }
    }

    // Categories grid
    const section = document.createElement('section');
    section.className = 'categories-section';
    section.innerHTML = `<h2 class="section-title">Choose a Category</h2>`;

    const grid = document.createElement('div');
    grid.className = 'categories-grid';

    categories.forEach((cat: Category, index: number) => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.id = `category-${cat.slug}`;
      card.style.animationDelay = `${index * 0.1}s`;
      card.innerHTML = `
        <div class="category-card__icon">${renderCategoryIcon(cat)}</div>
        <h3 class="category-card__name">${cat.name}</h3>
        <p class="category-card__desc">${cat.description || ''}</p>
        <span class="category-card__arrow">→</span>
      `;
      card.addEventListener('click', () => navigate(`/category/${cat.slug}`));
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <span class="error-state__icon">⚠️</span>
        <h2>Something went wrong</h2>
        <p>Could not load categories. Please try again.</p>
        <button class="btn btn--primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    console.error(err);
  }
}
