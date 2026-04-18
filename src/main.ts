import './styles/index.css';
import { createHeader } from './components/header';
import { renderHomePage } from './pages/home';
import { renderCategoryPage } from './pages/category';
import { renderResultsPage } from './pages/results';
import { renderResultsCategoryPage } from './pages/results-category';
import { renderProfilePage } from './pages/profile';
import { renderPrivacyPage } from './pages/privacy';
import { renderTermsPage } from './pages/terms';
import { addRoute, startRouter } from './router';
import { startSettingsRealtime } from './ceremony';

async function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = '';

  // Create header
  const header = await createHeader();
  app.appendChild(header);

  // Create main content area
  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = 'main';
  app.appendChild(main);

  // Create footer
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer__inner">
      <p class="footer__text">© ${new Date().getFullYear()} Junub Talent Awards</p>
      <p class="footer__tagline">Celebrating excellence in art, dance, and drama.</p>
      <nav class="footer__links" aria-label="Legal">
        <a href="#/privacy" class="footer__link">Privacy Policy</a>
        <span class="footer__sep" aria-hidden="true">·</span>
        <a href="#/terms" class="footer__link">Terms of Service</a>
      </nav>
    </div>
  `;
  app.appendChild(footer);

  // Register routes
  addRoute('/', () => renderHomePage(main));
  addRoute('/category/:slug', (params) => renderCategoryPage(main, params.slug));
  addRoute('/results', () => renderResultsPage(main));
  addRoute('/results/:slug', (params) => renderResultsCategoryPage(main, params.slug));
  addRoute('/profile', () => renderProfilePage(main));
  addRoute('/privacy', () => renderPrivacyPage(main));
  addRoute('/terms', () => renderTermsPage(main));

  // Start realtime ceremony updates so reveal lands instantly during the live ceremony.
  startSettingsRealtime();

  // Start router
  startRouter();
}

initApp();
