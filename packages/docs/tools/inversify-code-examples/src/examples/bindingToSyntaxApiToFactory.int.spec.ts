import { describe, expect, it } from 'vitest';

import {
  container,
  DieselCarFactory,
  DieselEngine,
} from './bindingToSyntaxApiToFactory';

describe('BindingToSyntax API (toFactory)', () => {
  it('should provide a factory able to provide a diesel engine', () => {
    expect(container.resolve(DieselCarFactory).createEngine(3)).toBeInstanceOf(
      DieselEngine,
    );
  });
});
