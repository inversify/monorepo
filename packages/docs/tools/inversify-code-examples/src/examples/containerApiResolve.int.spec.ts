import { describe, expect, it } from 'vitest';

import { ninja } from './containerApiResolve';

describe('Container API (resolve)', () => {
  it('should resolve unbound service', async () => {
    expect(ninja.fight()).toBe('cut!');
  });
});
