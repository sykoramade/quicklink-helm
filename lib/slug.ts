import { customAlphabet } from 'nanoid';

// Alphanumeric alphabet for slug generation
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateSlug = customAlphabet(alphabet, 7);

/**
 * Generate a random slug
 */
export function createSlug(): string {
  return generateSlug();
}

/**
 * Validate custom slug format
 * Alphanumeric + hyphens, 3-50 characters
 */
export function validateCustomSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }

  if (slug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters' };
  }

  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be at most 50 characters' };
  }

  const slugRegex = /^[a-zA-Z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, error: 'Slug can only contain alphanumeric characters and hyphens' };
  }

  // Cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  return { valid: true };
}
