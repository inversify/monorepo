import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiTo.js';

describe('BindingToSyntax API (to)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
