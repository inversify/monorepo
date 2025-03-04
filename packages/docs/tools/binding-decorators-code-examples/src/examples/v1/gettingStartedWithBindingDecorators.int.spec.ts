import { describe, expect, it } from 'vitest';

import { ninjaPromise } from './gettingStartedWithBindingDecorators';

interface Ninja {
  katana: {
    damage: number;
  };
}

describe('getting started with binding decorators', () => {
  it('should provide a ninja with a weapon with right damage', async () => {
    expect(((await ninjaPromise) as Ninja).katana.damage).toBe(10);
  });
});
