import { describe, expect, it } from 'vitest';
import { formatPrice, safeReturnTo } from './format';

describe('formatters and navigation safety', () => {
  it('formats minor BOB units without floating point input', () => {
    expect(formatPrice(1250)).toContain('12,50');
  });

  it('accepts only safe same-origin return paths', () => {
    expect(safeReturnTo('/checkout')).toBe('/checkout');
    expect(safeReturnTo('https://evil.example')).toBe('/');
    expect(safeReturnTo('//evil.example')).toBe('/');
    expect(safeReturnTo('/login?returnTo=/admin')).toBe('/');
  });
});
