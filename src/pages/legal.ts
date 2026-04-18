import { navigate } from '../router';
import { setMeta, siteUrl } from '../seo';

export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

export interface LegalDoc {
  kind: 'privacy' | 'terms';
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderLegalPage(container: HTMLElement, doc: LegalDoc): void {
  const path = doc.kind === 'privacy' ? '/privacy' : '/terms';
  const canonical = siteUrl(`/#${path}`);

  setMeta({
    title: doc.metaTitle,
    description: doc.metaDescription,
    canonical,
    ogType: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
          { '@type': 'ListItem', position: 2, name: doc.title, item: canonical },
        ],
      },
    ],
  });

  container.innerHTML = '';

  const article = document.createElement('article');
  article.className = 'legal';
  article.setAttribute('aria-labelledby', 'legal-title');

  const header = `
    <button class="page-header__back" id="legal-back-btn" type="button" aria-label="Back to home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>
    <h1 class="legal__title" id="legal-title">${escapeHtml(doc.title)}</h1>
    <p class="legal__updated"><strong>Last Updated:</strong> ${escapeHtml(doc.lastUpdated)}</p>
    <p class="legal__intro">${doc.intro}</p>
  `;

  const toc = `
    <nav class="legal__toc" aria-label="Table of contents">
      <h2 class="legal__toc-title">Contents</h2>
      <ol class="legal__toc-list">
        ${doc.sections
          .map(
            (s) =>
              `<li><a href="#${escapeHtml(s.id)}" class="legal__toc-link">${escapeHtml(s.title)}</a></li>`
          )
          .join('')}
      </ol>
    </nav>
  `;

  const sections = doc.sections
    .map(
      (s) => `
      <section class="legal__section" id="${escapeHtml(s.id)}" aria-labelledby="${escapeHtml(s.id)}-heading">
        <h2 class="legal__h2" id="${escapeHtml(s.id)}-heading">${escapeHtml(s.title)}</h2>
        ${s.body}
      </section>
    `
    )
    .join('');

  article.innerHTML = header + toc + sections;
  container.appendChild(article);

  article.querySelector('#legal-back-btn')?.addEventListener('click', () => navigate('/'));

  // Smooth-scroll for TOC links (honour prefers-reduced-motion).
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  article.querySelectorAll<HTMLAnchorElement>('.legal__toc-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = article.querySelector(`#${CSS.escape(id)}`);
      if (!target) return;
      e.preventDefault();
      (target as HTMLElement).scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      (target as HTMLElement).setAttribute('tabindex', '-1');
      (target as HTMLElement).focus({ preventScroll: true });
    });
  });
}
