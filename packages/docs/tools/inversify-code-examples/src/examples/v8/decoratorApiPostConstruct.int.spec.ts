import { describe, expect, it } from 'vitest';

import { katana } from './decoratorApiPostConstruct.js';

describe('Decorator API (postConstruct)', () => {
  it('should provide activated service', () => {
    expect(katana.damage).toBe(12);
  });
});
