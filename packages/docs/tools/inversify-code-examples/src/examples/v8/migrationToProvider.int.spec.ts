import { describe, expect, it } from 'vitest';

import { container } from './migrationToProvider.js';

describe('Migration (toProvider)', () => {
  it('should provide sword with given material and damage', async () => {
    type SwordProvider = (
      material: string,
      damage: number,
    ) => Promise<{
      material: string;
      damage: number;
    }>;

    const swordProvider: SwordProvider =
      container.get<SwordProvider>('SwordProvider');

    const sword: { material: string; damage: number } = await swordProvider(
      'gold',
      100,
    );

    expect(sword.material).toBe('gold');
    expect(sword.damage).toBe(100);
  });
});
