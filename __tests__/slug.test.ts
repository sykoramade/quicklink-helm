import { describe, it, expect } from 'vitest';
import { createSlug, validateCustomSlug } from '@/lib/slug';

describe('Slug generation', () => {
  it('generates a slug of correct length', () => {
    const slug = createSlug();
    expect(slug).toHaveLength(7);
  });

  it('generates alphanumeric slugs only', () => {
    for (let i = 0; i < 100; i++) {
      const slug = createSlug();
      expect(/^[a-zA-Z0-9]+$/.test(slug)).toBe(true);
    }
  });

  it('generates unique slugs across multiple calls', () => {
    const slugs = new Set();
    for (let i = 0; i < 1000; i++) {
      slugs.add(createSlug());
    }
    // Should have at least 950 unique slugs out of 1000
    expect(slugs.size).toBeGreaterThan(950);
  });
});

describe('Custom slug validation', () => {
  it('accepts valid alphanumeric slugs', () => {
    const result = validateCustomSlug('mylink');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts slugs with hyphens', () => {
    const result = validateCustomSlug('my-awesome-link');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty slugs', () => {
    const result = validateCustomSlug('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects slugs shorter than 3 characters', () => {
    const result = validateCustomSlug('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3');
  });

  it('rejects slugs longer than 50 characters', () => {
    const result = validateCustomSlug('a'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 50');
  });

  it('rejects slugs with special characters', () => {
    const result = validateCustomSlug('my@link');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects slugs starting with hyphen', () => {
    const result = validateCustomSlug('-mylink');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot start');
  });

  it('rejects slugs ending with hyphen', () => {
    const result = validateCustomSlug('mylink-');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('end');
  });

  it('accepts valid 3 character slug', () => {
    const result = validateCustomSlug('abc');
    expect(result.valid).toBe(true);
  });

  it('accepts valid 50 character slug', () => {
    const result = validateCustomSlug('a'.repeat(50));
    expect(result.valid).toBe(true);
  });
});
