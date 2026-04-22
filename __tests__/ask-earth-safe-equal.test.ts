import { describe, expect, it } from 'vitest';
import { safeEqual } from '@/lib/ask-earth/safe-equal';

describe('safeEqual', () => {
  it('returns true for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('', '')).toBe(true);
    const secret = 'QaYRQ1P+vY4CeRfxuhJqv0tskumMEupW1v8whlQkcog=';
    expect(safeEqual(secret, secret)).toBe(true);
  });

  it('returns false for differing strings of the same length', () => {
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('secret', 'SECRET')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('abcd', 'abc')).toBe(false);
    expect(safeEqual('', 'x')).toBe(false);
  });

  it('handles utf-8 multi-byte characters', () => {
    expect(safeEqual('café', 'café')).toBe(true);
    expect(safeEqual('café', 'cafe')).toBe(false);
  });
});
