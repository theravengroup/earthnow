import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison. Returns false immediately on length
 * mismatch (length is not secret — only content is) but without the
 * early-out on first differing byte that `===` performs.
 */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
