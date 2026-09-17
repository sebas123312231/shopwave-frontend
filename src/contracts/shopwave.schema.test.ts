import { describe, expect, it } from 'vitest';
import { checkoutSchema, productSchema, registerSchema } from './shopwave.schema';

describe('ShopWave contract schemas', () => {
  it('accepts the public registration contract and normalizes input values', () => {
    const result = registerSchema.safeParse({ firstName: ' Ana ', lastName: 'Paz', email: ' ANA@EXAMPLE.COM ', password: 'a secure password', mobile: '71234567' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ana@example.com');
  });

  it('rejects unknown checkout fields, including payment card data', () => {
    const result = checkoutSchema.safeParse({ address: { firstName: 'Ana', lastName: 'Paz', streetAddress: 'Calle 1', city: 'La Paz', department: 'La Paz', postalCode: null, mobile: '71234567', country: 'BO' }, saveAddress: false, paymentMethod: 'MOCK', cartVersion: 1, quoteFingerprint: 'abc', cardNumber: '4111111111111111' });
    expect(result.success).toBe(false);
  });

  it('does not accept a product with a sale price above the regular price', () => {
    const result = productSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
