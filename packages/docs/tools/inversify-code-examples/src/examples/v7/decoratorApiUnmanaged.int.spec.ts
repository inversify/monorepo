import { describe, expect, it } from 'vitest';

import { derivedProp } from './decoratorApiUnmanaged';

describe('Decorator API (unmanaged)', () => {
  it('should provide an instance with right property value', () => {
    expect(derivedProp).toBe('inherited-value');
  });
});
