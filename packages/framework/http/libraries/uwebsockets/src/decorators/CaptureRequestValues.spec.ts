import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../actions/setControllerMethodRequestTransformerList.js'));
vitest.mock(import('../calculations/buildCaptureRequestValuesTransformer.js'));

import { setControllerMethodRequestTransformerList } from '../actions/setControllerMethodRequestTransformerList.js';
import { buildCaptureRequestValuesTransformer } from '../calculations/buildCaptureRequestValuesTransformer.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { type RequestValueKind } from '../models/RequestValueKind.js';
import { CaptureRequestValues } from './CaptureRequestValues.js';

describe(CaptureRequestValues, () => {
  describe('having a request value kind list', () => {
    let methodKeyFixture: string;
    let requestValueKindListFixture: RequestValueKind[];
    let targetFixture: object;

    beforeAll(() => {
      methodKeyFixture = 'testMethod';
      requestValueKindListFixture = ['method', 'headers'];

      class TestController {
        public testMethod(): void {}
      }

      targetFixture = TestController.prototype;
    });

    describe('when called', () => {
      let requestTransformerFixture: RequestTransformer;

      beforeAll(() => {
        requestTransformerFixture = vitest.fn();

        vitest
          .mocked(buildCaptureRequestValuesTransformer)
          .mockReturnValueOnce(requestTransformerFixture);

        CaptureRequestValues(requestValueKindListFixture)(
          targetFixture,
          methodKeyFixture,
          {},
        );
      });

      it('should call buildCaptureRequestValuesTransformer()', () => {
        expect(
          buildCaptureRequestValuesTransformer,
        ).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          methodKeyFixture,
          requestValueKindListFixture,
        );
      });

      it('should register the capture request transformer', () => {
        expect(
          setControllerMethodRequestTransformerList,
        ).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          methodKeyFixture,
          [requestTransformerFixture],
        );
      });
    });
  });
});
