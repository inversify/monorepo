import { describe, expect, it } from 'vitest';

import { isBoundPromise } from './migrationV7Unload.js';

describe('Migration v7 (unload)', () => {
  it('should unload module', async () => {
    const isBound: boolean = await isBoundPromise;

    expect(isBound).toBe(false);
  });
});
