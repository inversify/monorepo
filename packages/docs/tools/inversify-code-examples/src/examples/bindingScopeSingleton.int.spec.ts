import { describe, expect, it } from 'vitest';

import { isSameKatana } from './bindingScopeSingleton';

describe('BindingInSyntax API (inSingletonScope)', () => {
  it('should provide same Katana', () => {
    expect(isSameKatana).toBe(true);
  });
});
