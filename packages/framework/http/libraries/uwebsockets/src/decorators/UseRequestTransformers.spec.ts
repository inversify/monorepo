import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../actions/setControllerMethodRequestTransformerList.js'));

import { setControllerMethodRequestTransformerList } from '../actions/setControllerMethodRequestTransformerList.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { UseRequestTransformers } from './UseRequestTransformers.js';

describe(UseRequestTransformers, () => {
  describe('having two request transformers', () => {
    let firstRequestTransformerFixture: RequestTransformer;
    let secondRequestTransformerFixture: RequestTransformer;
    let targetFixture: object;
    let methodKeyFixture: string;

    beforeAll(() => {
      firstRequestTransformerFixture = vitest.fn();
      secondRequestTransformerFixture = vitest.fn();
      methodKeyFixture = 'testMethod';

      class TestController {
        public testMethod(): void {}
      }

      targetFixture = TestController.prototype;
    });

    describe('when called', () => {
      beforeAll(() => {
        UseRequestTransformers(
          firstRequestTransformerFixture,
          secondRequestTransformerFixture,
        )(targetFixture, methodKeyFixture, {});
      });

      it('should register the request transformers in declaration order', () => {
        expect(
          setControllerMethodRequestTransformerList,
        ).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          methodKeyFixture,
          [firstRequestTransformerFixture, secondRequestTransformerFixture],
        );
      });
    });
  });
});
