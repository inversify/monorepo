import { describe, expect, it } from 'vitest';

import { Katana, katana } from './containerApiGet';

describe('Container API (get)', () => {
  it('should provide Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
