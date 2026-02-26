import { describe, expect, it } from 'vitest';

import { Katana, Ninja, ninjaPromise } from './migrationV7Load.js';

describe('Migration v7 (load)', () => {
  it('should load module and provide ninja', async () => {
    const ninja: Ninja = await ninjaPromise;

    expect(ninja).toBeInstanceOf(Ninja);
    expect(ninja.weapon).toBeInstanceOf(Katana);
  });
});
