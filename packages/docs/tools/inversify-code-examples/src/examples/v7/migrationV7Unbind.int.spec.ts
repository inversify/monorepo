import { describe, expect, it } from 'vitest';

import { isBound } from './migrationV7Unbind.js';

describe('Migration v7 (unbind)', () => {
  it('should unbind the service', () => {
    expect(isBound).toBe(false);
  });
});
