import { describe, expect, it } from 'vitest';

import { decorate, injectable } from '../..';

describe(injectable, () => {
  it('Should throw when applied multiple times', () => {
    @injectable()
    class Test {}

    const useDecoratorMoreThanOnce: () => void = function () {
      decorate([injectable(), injectable()], Test);
    };

    expect(useDecoratorMoreThanOnce).toThrow(
      'Cannot apply @injectable decorator multiple times',
    );
  });
});
