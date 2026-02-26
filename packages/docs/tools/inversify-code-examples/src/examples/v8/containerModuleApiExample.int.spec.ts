import { describe, expect, it } from 'vitest';

import { Ninja, ninjaPromise, Shuriken } from './containerModuleApiExample.js';

describe('ContainerModule API', () => {
  it('should provide expected service', async () => {
    const ninja: Ninja = await ninjaPromise;

    expect(ninja).toBeInstanceOf(Ninja);
    expect(ninja.weapon).toBeInstanceOf(Shuriken);
  });
});
