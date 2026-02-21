import { describe, expect, it } from 'vitest';

import { Ninja, ninja, Shuriken } from './containerModuleApiExample.js';

describe('ContainerModule API', () => {
  it('should provide expected service', async () => {
    expect(ninja).toBeInstanceOf(Ninja);
    expect(ninja.weapon).toBeInstanceOf(Shuriken);
  });
});
