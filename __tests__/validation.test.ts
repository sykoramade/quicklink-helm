import { describe, it, expect } from 'vitest';
import { validateUrl } from '@/lib/validation';

describe('URL validation', () => {
  it('accepts valid http URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts valid https URLs', () => {
    const result = validateUrl('https://example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts URLs with paths', () => {
    const result = validateUrl('https://example.com/path/to/page');
    expect(result.valid).toBe(true);
  });

  it('accepts URLs with query parameters', () => {
    const result = validateUrl('https://example.com?foo=bar&baz=qux');
    expect(result.valid).toBe(true);
  });

  it('accepts URLs with fragments', () => {
    const result = validateUrl('https://example.com#section');
    expect(result.valid).toBe(true);
  });

  it('rejects empty URLs', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects URLs without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('http');
  });

  it('rejects URLs with ftp protocol', () => {
    const result = validateUrl('ftp://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('http');
  });

  it('rejects malformed URLs', () => {
    const result = validateUrl('https://not a valid url');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid');
  });

  it('accepts URLs with special characters in path', () => {
    const result = validateUrl('https://example.com/search?q=hello%20world');
    expect(result.valid).toBe(true);
  });

  it('accepts localhost URLs', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(true);
  });
});
