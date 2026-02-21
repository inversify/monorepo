import { describe, expect, it } from 'vitest';

import { Katana, samurai } from './fundamentalsAutobinding.js';

describe('Fundamentals: Auto binding', () => {
  it('should provide a katana when resolving a samurai service', () => {
    expect(samurai.katana).toBeInstanceOf(Katana);
  });
});
