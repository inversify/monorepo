import { describe, expect, it } from '@jest/globals';

import { ninja } from './decoratorApiNamed';

describe('Decorator API (named)', () => {
  it('should provide a ninja with right weapons', () => {
    expect(ninja.katana.damage).toBe(10);
    expect(ninja.shuriken.damage).toBe(5);
  });
});
