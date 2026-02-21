import { describe, expect, it } from 'vitest';

import { Katana, katana } from './bindingToSyntaxApiToDynamicValue.js';

describe('BindingToSyntax API (toDynamicValue)', () => {
  it('should bind Katana weapon', () => {
    expect(katana).toBeInstanceOf(Katana);
  });
});
