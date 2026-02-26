import { describe, expect, it } from 'vitest';

import { isBound } from './migrationV7UnbindAll.js';

describe('Migration v7 (unbindAll)', () => {
  it('should unbind all services', () => {
    expect(isBound).toBe(false);
  });
});
