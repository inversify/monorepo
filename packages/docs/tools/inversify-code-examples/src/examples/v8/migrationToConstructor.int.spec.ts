import { describe, expect, it } from 'vitest';

import { Katana, weapon, weaponClass } from './migrationToConstructor.js';

describe('Migration (toConstructor)', () => {
  it('should bind Katana weapon constructor', () => {
    expect(weaponClass).toBe(Katana);
    expect(weapon).toBeInstanceOf(Katana);
    expect(weapon.damage).toBe(10);
  });
});
