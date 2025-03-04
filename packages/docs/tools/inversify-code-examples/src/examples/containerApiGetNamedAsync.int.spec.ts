import { describe, expect, it } from 'vitest';

import {
  Katana,
  katana,
  Shuriken,
  shuriken,
} from './containerApiGetNamedAsync';

describe('Container API (getNamed)', () => {
  it('should provide Katana weapon', async () => {
    await expect(katana).resolves.toBeInstanceOf(Katana);
    await expect(shuriken).resolves.toBeInstanceOf(Shuriken);
  });
});
