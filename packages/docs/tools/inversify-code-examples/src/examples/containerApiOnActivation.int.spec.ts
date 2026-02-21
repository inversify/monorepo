import { describe, expect, it } from 'vitest';

import { katana } from './containerApiOnActivation.js';

describe('Container API (onActivation)', () => {
  it('should provide activated service', () => {
    expect(katana.damage).toBe(12);
  });
});
