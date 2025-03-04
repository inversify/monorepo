import { describe, expect, it } from 'vitest';

import { Katana, samurai } from './fundamentalsBindingFromClassMetadata';

describe('Fundamentals: Binding from emitted class metadata', () => {
  it('should provide a katana when resolving a samurai service', () => {
    expect(samurai.katana).toBeInstanceOf(Katana);
  });
});
