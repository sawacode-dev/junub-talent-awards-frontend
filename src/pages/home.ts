import { fetchCategories } from '../api';
import type { Category } from '../api';
import { showPageLoader } from '../components/loader';
import { navigate } from '../router';

export async function renderHomePage(container: HTMLElement) {
  showPageLoader(container);

  try {
    const categories = await fetchCategories();
    container.innerHTML = '';

    // Hero section
    const hero = document.createElement('section');
    hero.className = 'hero';
    hero.innerHTML = `
      <div class="hero__content">
        <span class="hero__badge">🏆 Season 1 — Live Now</span>
        <h1 class="hero__title">
          Vote for Your
          <span class="hero__title-accent">Favorite Stars</span>
        </h1>
        <p class="hero__subtitle">
          Choose the best in music, comedy, film, sports and more.
          One vote per category, every 24 hours. Sign in with Google to make your voice heard.
        </p>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">${categories.length}</span>
            <span class="hero__stat-label">Categories</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">20</span>
            <span class="hero__stat-label">Celebrities</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">24h</span>
            <span class="hero__stat-label">Vote Cycle</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(hero);

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
        <div class="category-card__icon">${cat.icon}</div>
        <h3 class="category-card__name">${cat.name}</h3>
        <p class="category-card__desc">${cat.description}</p>
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
