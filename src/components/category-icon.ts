import type { Category } from '../api';
import { escapeHtml } from './leaderboard-row';

const FALLBACK_EMOJI = '🏆';

export function renderCategoryIcon(category: Pick<Category, 'icon' | 'image_url' | 'name'>): string {
  if (category.image_url) {
    const safeName = escapeHtml(category.name);
    const safeUrl = escapeHtml(category.image_url);
    const fallback = category.icon || FALLBACK_EMOJI;
    return `<img class="category-icon-img" src="${safeUrl}" alt="${safeName} icon" loading="lazy" onerror="this.outerHTML='<span class=\\'category-icon-fallback\\'>${escapeHtml(fallback)}</span>';" />`;
  }
  return category.icon || FALLBACK_EMOJI;
}
