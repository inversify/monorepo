import { describe, expect, it } from 'vitest';

import { valuesAfterRebind, valuesBeforeRebind } from './containerApiRebind';

describe('Container API (rebind)', () => {
  it('should rebind service bindings', async () => {
    expect(valuesAfterRebind).toStrictEqual([3]);
    expect(valuesBeforeRebind).toStrictEqual([1, 2]);
  });
});
