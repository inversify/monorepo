import { describe, expect, it } from 'vitest';

import { isBound } from './migrationV7Unload.js';

describe('Migration v7 (unload)', () => {
  it('should unload module', () => {
    expect(isBound).toBe(false);
  });
});
