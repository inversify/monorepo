import { describe, expect, it } from 'vitest';

import { Katana, katana } from './containerApiGet.js';

describe('Container API (get)', () => {
  it('should provide Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
