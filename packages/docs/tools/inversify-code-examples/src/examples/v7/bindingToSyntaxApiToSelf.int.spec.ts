import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiToSelf.js';

describe('BindingToSyntax API (toSelf)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
