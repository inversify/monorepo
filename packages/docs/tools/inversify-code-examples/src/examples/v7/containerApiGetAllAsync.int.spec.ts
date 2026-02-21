import { describe, expect, it } from 'vitest';

import { Katana, Shuriken, weapons } from './containerApiGetAllAsync.js';

describe('Container API (getAllAsync)', () => {
  it('should provide weapons', async () => {
    await expect(weapons).resolves.toStrictEqual([
      new Katana(),
      new Shuriken(),
    ]);
  });
});
