import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiToSelf';

describe('BindingToSyntax API (toSelf)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
