import { describe, expect, it } from 'vitest';

import { ninjaWeaponDamage } from './decoratorApiInjectConstructorArgument.js';

describe('Decorator API (inject)', () => {
  it('should provide a ninja with a weapon with right damage', () => {
    expect(ninjaWeaponDamage).toBe(10);
  });
});
