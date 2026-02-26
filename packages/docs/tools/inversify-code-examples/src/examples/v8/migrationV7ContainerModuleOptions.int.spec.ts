import { describe, expect, it } from 'vitest';

import { container, Shuriken } from './migrationV7ContainerModuleOptions.js';

describe('Migration v7 (ContainerModuleLoadOptions)', () => {
  it('should rebind to Shuriken via module options', () => {
    const weapon: { damage: number } = container.get<{ damage: number }>(
      'Weapon',
    );

    expect(weapon).toBeInstanceOf(Shuriken);
    expect(weapon.damage).toBe(8);
  });
});
