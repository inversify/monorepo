import { describe, expect, it } from 'vitest';

import {
  Shuriken,
  weaponPromise,
} from './migrationV7ContainerModuleOptions.js';

describe('Migration v7 (ContainerModuleLoadOptions)', () => {
  it('should rebind to Shuriken via module options', async () => {
    const weapon: { damage: number } = await weaponPromise;

    expect(weapon).toBeInstanceOf(Shuriken);
    expect(weapon.damage).toBe(8);
  });
});
