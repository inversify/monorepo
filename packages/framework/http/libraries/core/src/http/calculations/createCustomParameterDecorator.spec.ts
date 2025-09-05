import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildRequestParameterDecorator } from './buildRequestParameterDecorator';
import { createCustomParameterDecorator } from './createCustomParameterDecorator';

describe(createCustomParameterDecorator, () => {
  describe('when called', () => {
    let handlerFixture: CustomParameterDecoratorHandler;
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      handlerFixture = {} as CustomParameterDecoratorHandler;
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = createCustomParameterDecorator(handlerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParamFactory', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.Custom,
        [],
        undefined,
        handlerFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
