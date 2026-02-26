import { describe, expect, it } from 'vitest';

import { katana } from './decorateMethodDecorator.js';

describe('decorate API (MethodDecorator)', () => {
  it('should apply postConstruct decorator to method', () => {
    // Since postConstruct is applied, improve() should be called automatically
    // and damage should be increased from 10 to 12
    expect(katana.damage).toBe(12);
  });
});
