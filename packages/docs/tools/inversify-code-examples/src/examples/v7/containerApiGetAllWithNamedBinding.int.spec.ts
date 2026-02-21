import { describe, expect, it } from 'vitest';

import { Katana, weapons } from './containerApiGetAllWithNamedBindings.js';

describe('Container API (getAll with named binding)', () => {
  it('should provide weapons', async () => {
    expect(weapons).toStrictEqual([new Katana()]);
  });
});
