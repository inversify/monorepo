import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));
vitest.mock(import('../actions/setValidateMetadata.js'));
vitest.mock(import('../../validation/calculations/getMimeType.js'));
vitest.mock(import('../../validation/calculations/getPath.js'));

import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getMimeType } from '../../validation/calculations/getMimeType.js';
import { getPath } from '../../validation/calculations/getPath.js';
import { type BodyValidationInputParam } from '../../validation/models/BodyValidationInputParam.js';
import { validatedInputParamBodyType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';
import { ValidatedBody } from './ValidatedBody.js';

describe(ValidatedBody, () => {
  describe('when called', () => {
    let result: ParameterDecorator;

    beforeAll(() => {
      result = ValidatedBody();
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
    ) => Promise<BodyValidationInputParam<unknown>>;

    beforeAll(() => {
      vitest
        .mocked(createCustomParameterDecorator)
        .mockReturnValueOnce(vitest.fn() as unknown as ParameterDecorator);

      const decorator: ParameterDecorator = ValidatedBody();

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

    describe('when called, and getHeaders() returns a string', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let bodyFixture: object;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let mimeTypeFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        bodyFixture = { name: 'test' };
        methodFixture = 'POST';
        urlFixture = '/users';
        pathFixture = '/users';
        mimeTypeFixture = 'application/json';

        vitest.mocked(getMimeType).mockReturnValueOnce(mimeTypeFixture);
        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn().mockResolvedValueOnce(bodyFixture),
          getHeaders: vitest
            .fn()
            .mockReturnValueOnce('application/json; charset=utf-8'),
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

      it('should call getMimeType()', () => {
        expect(getMimeType).toHaveBeenCalledExactlyOnceWith(
          'application/json; charset=utf-8',
        );
      });

      it('should return a BodyValidationInputParam', () => {
        const expected: BodyValidationInputParam<unknown> = {
          body: bodyFixture,
          contentType: mimeTypeFixture,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamBodyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and getHeaders() returns an array with a value', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let bodyFixture: object;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let mimeTypeFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        bodyFixture = { name: 'test' };
        methodFixture = 'PUT';
        urlFixture = '/items';
        pathFixture = '/items';
        mimeTypeFixture = 'text/plain';

        vitest.mocked(getMimeType).mockReturnValueOnce(mimeTypeFixture);
        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn().mockResolvedValueOnce(bodyFixture),
          getHeaders: vitest.fn().mockReturnValueOnce(['text/plain']),
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

      it('should call getMimeType()', () => {
        expect(getMimeType).toHaveBeenCalledExactlyOnceWith('text/plain');
      });

      it('should return a BodyValidationInputParam', () => {
        const expected: BodyValidationInputParam<unknown> = {
          body: bodyFixture,
          contentType: mimeTypeFixture,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamBodyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and getHeaders() returns an array with undefined first element', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let bodyFixture: object;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        bodyFixture = { name: 'test' };
        methodFixture = 'PATCH';
        urlFixture = '/items/1';
        pathFixture = '/items/1';

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn().mockResolvedValueOnce(bodyFixture),
          getHeaders: vitest.fn().mockReturnValueOnce([undefined]),
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

      it('should not call getMimeType()', () => {
        expect(getMimeType).not.toHaveBeenCalled();
      });

      it('should return a BodyValidationInputParam', () => {
        const expected: BodyValidationInputParam<unknown> = {
          body: bodyFixture,
          contentType: undefined,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamBodyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and getHeaders() returns undefined', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let bodyFixture: object;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        bodyFixture = { name: 'test' };
        methodFixture = 'DELETE';
        urlFixture = '/items/2';
        pathFixture = '/items/2';

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn().mockResolvedValueOnce(bodyFixture),
          getHeaders: vitest.fn().mockReturnValueOnce(undefined),
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

      it('should not call getMimeType()', () => {
        expect(getMimeType).not.toHaveBeenCalled();
      });

      it('should return a BodyValidationInputParam', () => {
        const expected: BodyValidationInputParam<unknown> = {
          body: bodyFixture,
          contentType: undefined,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamBodyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and getHeaders() returns an empty array', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let bodyFixture: object;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        bodyFixture = {};
        methodFixture = 'POST';
        urlFixture = '/empty';
        pathFixture = '/empty';

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn().mockResolvedValueOnce(bodyFixture),
          getHeaders: vitest.fn().mockReturnValueOnce([]),
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

      it('should not call getMimeType()', () => {
        expect(getMimeType).not.toHaveBeenCalled();
      });

      it('should return a BodyValidationInputParam', () => {
        const expected: BodyValidationInputParam<unknown> = {
          body: bodyFixture,
          contentType: undefined,
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          type: validatedInputParamBodyType,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
