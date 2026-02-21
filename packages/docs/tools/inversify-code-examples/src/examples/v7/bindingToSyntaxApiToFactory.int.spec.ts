import { describe, expect, it } from 'vitest';

import {
  container,
  DieselCarFactory,
  DieselEngine,
} from './bindingToSyntaxApiToFactory.js';

describe('BindingToSyntax API (toFactory)', () => {
  it('should provide a factory able to provide a diesel engine', () => {
    container.bind(DieselCarFactory).toSelf();

    expect(container.get(DieselCarFactory).createEngine(3)).toBeInstanceOf(
      DieselEngine,
    );
  });
});
