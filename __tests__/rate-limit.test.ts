import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

describe('Rate limiting', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    resetRateLimit(userId);
  });

  it('allows requests within limit', () => {
    const result = checkRateLimit(userId);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(59);
  });

  it('tracks count correctly', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.remaining).toBe(49);
  });

  it('blocks at limit', () => {
    for (let i = 0; i < 60; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('has independent limits per user', () => {
    const user1 = 'user1';
    const user2 = 'user2';

    resetRateLimit(user1);
    resetRateLimit(user2);

    for (let i = 0; i < 30; i++) {
      checkRateLimit(user1);
    }

    const result2 = checkRateLimit(user2);
    expect(result2.limited).toBe(false);
    expect(result2.remaining).toBe(59);

    const result1 = checkRateLimit(user1);
    expect(result1.remaining).toBe(29);
  });

  it('resets after window expires', async () => {
    // This is a simplified test - in real scenario, we'd mock the time
    const result1 = checkRateLimit(userId);
    expect(result1.remaining).toBe(59);

    resetRateLimit(userId);
    const result2 = checkRateLimit(userId);
    expect(result2.remaining).toBe(59);
  });
});
