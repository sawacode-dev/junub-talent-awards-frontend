export interface SeoConfig {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: object[];
}

const SITE_URL = 'https://junubtalentsawards.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DYNAMIC_ATTR = 'data-seo';
const DYNAMIC_VALUE = 'dynamic';

function clearDynamic(): void {
  document.head
    .querySelectorAll(`[${DYNAMIC_ATTR}="${DYNAMIC_VALUE}"]`)
    .forEach((el) => el.remove());
}

function addMeta(attr: 'name' | 'property', key: string, content: string): void {
  const el = document.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
  el.setAttribute(DYNAMIC_ATTR, DYNAMIC_VALUE);
  document.head.appendChild(el);
}

function addLink(rel: string, href: string): void {
  const el = document.createElement('link');
  el.setAttribute('rel', rel);
  el.setAttribute('href', href);
  el.setAttribute(DYNAMIC_ATTR, DYNAMIC_VALUE);
  document.head.appendChild(el);
}

function addJsonLd(data: object): void {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/ld+json');
  el.setAttribute(DYNAMIC_ATTR, DYNAMIC_VALUE);
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

export function setMeta(config: SeoConfig): void {
  clearDynamic();

  document.title = config.title;

  const ogType = config.ogType ?? 'website';
  const ogImage = config.ogImage ?? DEFAULT_OG_IMAGE;
  const robots = config.noindex ? 'noindex, follow' : 'index, follow';

  addMeta('name', 'description', config.description);
  addMeta('name', 'robots', robots);
  addLink('canonical', config.canonical);

  addMeta('property', 'og:title', config.title);
  addMeta('property', 'og:description', config.description);
  addMeta('property', 'og:url', config.canonical);
  addMeta('property', 'og:image', ogImage);
  addMeta('property', 'og:type', ogType);

  addMeta('name', 'twitter:title', config.title);
  addMeta('name', 'twitter:description', config.description);
  addMeta('name', 'twitter:image', ogImage);

  if (config.jsonLd && config.jsonLd.length > 0) {
    config.jsonLd.forEach(addJsonLd);
  }
}

export function slugifyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function siteUrl(path = ''): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function eventYear(electionEnd: string | null | undefined): number {
  if (electionEnd) {
    const d = new Date(electionEnd);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return new Date().getFullYear();
}
