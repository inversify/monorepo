import { describe, expect, it } from 'vitest';

import { soldier } from './decoratorApiInjectFromBaseProperties';

describe('Decorator API (inject)', () => {
  it('should provide a ninja with a weapon with right damage', () => {
    expect(soldier.weapon).toBe('sword');
  });
});
