import { describe, expect, it } from 'vitest';

import { container, Katana, Ninja } from './migrationV7Load.js';

describe('Migration v7 (load)', () => {
  it('should load module and provide ninja', () => {
    const ninja: Ninja = container.get(Ninja);

    expect(ninja).toBeInstanceOf(Ninja);
    expect(ninja.weapon).toBeInstanceOf(Katana);
  });
});
