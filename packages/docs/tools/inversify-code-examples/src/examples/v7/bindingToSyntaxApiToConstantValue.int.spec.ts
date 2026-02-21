import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiToConstantValue.js';

describe('BindingToSyntax API (toConstantValue)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
