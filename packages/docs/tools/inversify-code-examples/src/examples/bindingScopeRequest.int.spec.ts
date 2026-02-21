import { describe, expect, it } from 'vitest';

import { isSameKatana, warriorHasSameKatana } from './bindingScopeRequest.js';

describe('BindingInSyntax API (inSingletonScope)', () => {
  it('should provide same Katana', () => {
    expect(isSameKatana).toBe(false);
    expect(warriorHasSameKatana).toBe(true);
  });
});
