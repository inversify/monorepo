import { describe, expect, it } from 'vitest';

import { isSameKatana } from './bindingScopeTransient.js';

describe('BindingInSyntax API (inTransientScope)', () => {
  it('should not provide same Katana', () => {
    expect(isSameKatana).toBe(false);
  });
});
