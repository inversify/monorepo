import { describe, expect, it } from 'vitest';

import { Level1, level1 } from './containerApiGetAsync.js';

describe('Container API (getAsync)', () => {
  it('should provide async service', async () => {
    await expect(level1).resolves.toBeInstanceOf(Level1);
  });
});
