import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiToConstantValue';

describe('BindingToSyntax API (toConstantValue)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
