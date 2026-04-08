import './styles/index.css';
import { createHeader } from './components/header';
import { renderHomePage } from './pages/home';
import { renderCategoryPage } from './pages/category';
import { renderResultsPage } from './pages/results';
import { addRoute, startRouter } from './router';

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
      <p class="footer__text">© ${new Date().getFullYear()} SawaVote — Built by <a href="https://sawacode.com" target="_blank" rel="noopener" class="footer__link">SawaCode</a></p>
      <p class="footer__tagline">One person. One vote. Every day.</p>
    </div>
  `;
  app.appendChild(footer);

  // Register routes
  addRoute('/', () => renderHomePage(main));
  addRoute('/category/:slug', (params) => renderCategoryPage(main, params.slug));
  addRoute('/results', () => renderResultsPage(main));

  // Start router
  startRouter();
}

initApp();
