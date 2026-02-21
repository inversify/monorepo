import { describe, expect, it } from 'vitest';

import { ninja } from './decoratorApiOptional.js';

describe('Decorator API (optional)', () => {
  it('should provide a ninja with right weapons', () => {
    expect(ninja.katana.damage).toBe(10);
    expect(ninja.shuriken).toBeUndefined();
  });
});
