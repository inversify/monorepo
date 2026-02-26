import { describe, expect, it } from 'vitest';

import { Shuriken, weapon } from './migrationV7Rebind.js';

describe('Migration v7 (rebind)', () => {
  it('should rebind to Shuriken', () => {
    expect(weapon).toBeInstanceOf(Shuriken);
    expect(weapon.damage).toBe(8);
  });
});
