import { describe, expect, it } from 'vitest';

import { Katana, katana, Shuriken, shuriken } from './containerApiGetNamed.js';

describe('Container API (getNamed)', () => {
  it('should provide Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
    expect(shuriken).toBeInstanceOf(Shuriken);
  });
});
