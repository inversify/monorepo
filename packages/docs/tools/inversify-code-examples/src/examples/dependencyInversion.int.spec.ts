import { describe, expect, it } from 'vitest';

import { ninja } from './dependencyInversion';

describe('dependency inversion', () => {
  it('should provide a ninja with a weapon with right damage', () => {
    expect(ninja.weapon.damage).toBe(10);
  });
});
