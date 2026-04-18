import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));
vitest.mock(import('../actions/setValidateMetadata.js'));
vitest.mock(import('../../validation/calculations/getPath.js'));

import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getPath } from '../../validation/calculations/getPath.js';
import { type HeaderValidationInputParam } from '../../validation/models/HeaderValidationInputParam.js';
import { validatedInputParamHeaderType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';
import { ValidatedHeaders } from './ValidatedHeaders.js';

describe(ValidatedHeaders, () => {
  describe('when called', () => {
    let result: ParameterDecorator;

    beforeAll(() => {
      result = ValidatedHeaders();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a function', () => {
      expect(result).toBeTypeOf('function');
    });

    describe('when the returned decorator is applied', () => {
      let targetFixture: object;
      let keyFixture: string;
      let indexFixture: number;
      let innerDecoratorMock: ReturnType<typeof vitest.fn>;

      beforeAll(() => {
        targetFixture = class {};
        keyFixture = 'someMethod';
        indexFixture = 0;
        innerDecoratorMock = vitest.fn();

        vitest
          .mocked(createCustomParameterDecorator)
          .mockReturnValueOnce(
            innerDecoratorMock as unknown as ParameterDecorator,
          );

        result(targetFixture, keyFixture, indexFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setValidateMetadata', () => {
        expect(setValidateMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      it('should call createCustomParameterDecorator', () => {
        expect(createCustomParameterDecorator).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });

      it('should apply the parameter decorator from createCustomParameterDecorator', () => {
        expect(innerDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });
    });
  });

  describe('handler', () => {
    let handler: (
      request: unknown,
      response: unknown,
      options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
    ) => Promise<HeaderValidationInputParam>;

    beforeAll(() => {
      vitest
        .mocked(createCustomParameterDecorator)
        .mockReturnValueOnce(vitest.fn() as unknown as ParameterDecorator);

      const decorator: ParameterDecorator = ValidatedHeaders();

      decorator(class {}, 'method', 0);

      handler = (
        vitest.mocked(createCustomParameterDecorator).mock.calls[0] as [
          typeof handler,
        ]
      )[0];
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    describe('when called', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let headersFixture: Record<string, string | string[] | undefined>;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        headersFixture = {
          'content-type': 'application/json',
          'x-api-key': 'abc123',
        };
        methodFixture = 'GET';
        urlFixture = '/users';
        pathFixture = '/users';

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn(),
          getHeaders: vitest.fn().mockReturnValueOnce(headersFixture),
          getMethod: vitest.fn().mockReturnValueOnce(methodFixture),
          getUrl: vitest.fn().mockReturnValueOnce(urlFixture),
        } as unknown as CustomParameterDecoratorHandlerOptions<
          unknown,
          unknown
        >);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPath()', () => {
        expect(getPath).toHaveBeenCalledExactlyOnceWith(urlFixture);
      });

      it('should return a HeaderValidationInputParam', () => {
        const expected: HeaderValidationInputParam = {
          headers: headersFixture,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamHeaderType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
