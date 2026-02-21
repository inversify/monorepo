import { describe, expect, it } from 'vitest';

import { container, Ninja } from './migrationToAutoFactory.js';

describe('Migration (toAutoFactory)', () => {
  it('should provide ninja', () => {
    const ninja: Ninja = container.get(Ninja);

    expect(ninja.fight()).toBe('hit!');
  });
});
