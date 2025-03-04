import { describe, expect, it } from 'vitest';

import {
  allWeapons,
  Katana,
  notAllWeapons,
  Shuriken,
} from './containerApiGetAllEnforced';

describe('Container API (getAll)', () => {
  it('should provide weapons', () => {
    expect(allWeapons).toStrictEqual([new Katana(), new Shuriken()]);
    expect(notAllWeapons).toStrictEqual([new Katana()]);
  });
});
