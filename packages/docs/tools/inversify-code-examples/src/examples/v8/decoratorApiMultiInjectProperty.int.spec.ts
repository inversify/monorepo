import { describe, expect, it } from 'vitest';

import { ninjaWeaponDamage } from './decoratorApiMultiInjectProperty.js';

describe('Decorator API (multiInject)', () => {
  it('should provide a ninja with a weapon with right damage', () => {
    expect(ninjaWeaponDamage).toBe(10);
  });
});
