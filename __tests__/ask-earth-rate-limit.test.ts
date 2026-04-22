import { describe, expect, it } from 'vitest';
import { extractIp } from '@/lib/ask-earth/rate-limit';

function req(headers: Record<string, string>): Request {
  return new Request('http://localhost/', { headers });
}

describe('extractIp', () => {
  it('prefers x-vercel-forwarded-for (Vercel-set, not user-controllable)', () => {
    const r = req({
      'x-vercel-forwarded-for': '203.0.113.5',
      'x-forwarded-for': '198.51.100.99, 203.0.113.5',
      'x-real-ip': '198.51.100.99',
    });
    expect(extractIp(r)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip when x-vercel-forwarded-for is absent', () => {
    const r = req({ 'x-real-ip': '203.0.113.5' });
    expect(extractIp(r)).toBe('203.0.113.5');
  });

  it('falls back to the LAST entry of x-forwarded-for, not the first', () => {
    // Attacker sends `x-forwarded-for: 1.2.3.4` → Vercel appends real IP at
    // the end. Taking the first entry would trust the attacker.
    const r = req({ 'x-forwarded-for': '1.2.3.4, 203.0.113.5' });
    expect(extractIp(r)).toBe('203.0.113.5');
  });

  it('handles single-value x-forwarded-for', () => {
    const r = req({ 'x-forwarded-for': '203.0.113.5' });
    expect(extractIp(r)).toBe('203.0.113.5');
  });

  it('does NOT trust attacker-controlled first entry when fallback applies', () => {
    const attackerRotated = '1.2.3.4, 203.0.113.5';
    const attackerRotatedDifferent = '99.99.99.99, 203.0.113.5';
    const r1 = req({ 'x-forwarded-for': attackerRotated });
    const r2 = req({ 'x-forwarded-for': attackerRotatedDifferent });
    // Both should hash to the same real client IP, foiling per-request rotation
    expect(extractIp(r1)).toBe(extractIp(r2));
  });

  it('returns 0.0.0.0 when no IP headers are present', () => {
    expect(extractIp(req({}))).toBe('0.0.0.0');
  });
});
