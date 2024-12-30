import { describe, expect, it } from '@jest/globals';

import { Katana, katana, Shuriken, shuriken } from './containerApiGetNamed';

describe('Container API (getNamed)', () => {
  it('should provide Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
    expect(shuriken).toBeInstanceOf(Shuriken);
  });
});