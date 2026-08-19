import { describe, expect, it } from 'vitest';
import { getProductSchemaCondition } from '../productSeo';

describe('getProductSchemaCondition', () => {
  it('maps only explicit New inventory to NewCondition', () => {
    expect(getProductSchemaCondition('New')).toBe('https://schema.org/NewCondition');
  });

  it.each(['Mint', 'Like New', 'Excellent', 'Good', 'Fair', 'new', '', undefined])(
    'maps the pre-owned grade %s to UsedCondition',
    (condition) => {
      expect(getProductSchemaCondition(condition)).toBe('https://schema.org/UsedCondition');
    },
  );
});
