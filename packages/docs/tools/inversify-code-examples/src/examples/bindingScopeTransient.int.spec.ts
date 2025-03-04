import { describe, expect, it } from 'vitest';

import { isSameKatana } from './bindingScopeTransient';

describe('BindingInSyntax API (inTransientScope)', () => {
  it('should provide same Katana', () => {
    expect(isSameKatana).toBe(false);
  });
});
