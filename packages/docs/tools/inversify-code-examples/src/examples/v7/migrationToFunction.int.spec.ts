import { describe, expect, expectTypeOf, it } from 'vitest';

import { greetFn, greeting } from './migrationToFunction.js';

describe('Migration (toFunction)', () => {
  it('should bind function as constant value', () => {
    expectTypeOf(greetFn).toBeFunction();

    expect(greeting).toBe('Hello, World!');
  });
});
