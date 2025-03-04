import { describe, expect, it } from 'vitest';

import {
  Katana,
  katana,
  Shuriken,
  shuriken,
} from './containerApiGetTaggedAsync';

describe('Container API (getTagged)', () => {
  it('should provide weapon services', async () => {
    await expect(katana).resolves.toBeInstanceOf(Katana);
    await expect(shuriken).resolves.toBeInstanceOf(Shuriken);
  });
});
