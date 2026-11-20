import { COLORS, DEFAULT_CATEGORY_COLOR } from '../constants/colors';

/**
 * Checks whether a category is marked as hidden from filter bars.
 * @param {object} cat
 * @returns {boolean}
 */
export function isCategoryHidden(cat) {
  return Boolean(cat?.icon && (cat.icon === 'hidden' || cat.icon.endsWith(':hidden')));
}

/**
 * Normalizes a hex color string (#RGB or #RRGGBB) or falls back to default color.
 * @param {string} hex
 * @param {string} [fallback]
 * @returns {string}
 */
export function normalizeHexColor(hex, fallback = COLORS[0] || DEFAULT_CATEGORY_COLOR) {
  if (typeof hex === 'string') {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
  }
  return fallback;
}

/**
 * Filters note categories belonging to a specific notebook (including legacy categories used in that notebook).
 * @param {Array} categories
 * @param {string|number} notebookId
 * @param {Array} usedCategoryIds
 * @returns {Array}
 */
export function filterCategoriesForNotebook(categories = [], notebookId, usedCategoryIds = []) {
  if (!notebookId) return categories || [];
  const usedSet = new Set(usedCategoryIds || []);
  return (categories || []).filter(
    (cat) =>
      cat.icon === `nb:${notebookId}` ||
      cat.icon === `nb:${notebookId}:hidden` ||
      ((!cat.icon || (!cat.icon.startsWith('nb:') && cat.icon !== 'hidden')) && usedSet.has(cat.id))
  );
}

