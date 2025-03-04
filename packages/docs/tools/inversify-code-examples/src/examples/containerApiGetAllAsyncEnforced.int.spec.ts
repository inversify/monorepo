import { describe, expect, it } from 'vitest';

import {
  allWeapons,
  Katana,
  notAllWeapons,
  Shuriken,
} from './containerApiGetAllAsyncEnforced';

describe('Container API (getAllAsync)', () => {
  it('should provide weapons', async () => {
    await expect(allWeapons).resolves.toStrictEqual([
      new Katana(),
      new Shuriken(),
    ]);
    await expect(notAllWeapons).resolves.toStrictEqual([new Katana()]);
  });
});
