import { describe, expect, it } from 'vitest';

import { soldier } from './decoratorApiInjectFromBaseConstructorArguments.js';

describe('Decorator API (inject)', () => {
  it('should provide a soldier with a weapon with right damage', () => {
    expect(soldier.weapon).toBe('sword');
  });
});
