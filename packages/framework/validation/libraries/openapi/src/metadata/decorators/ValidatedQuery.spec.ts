import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));
vitest.mock(import('../actions/setValidateMetadata.js'));
vitest.mock(import('../../validation/calculations/getPath.js'));

import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPath } from '../../validation/calculations/getPath.js';
import { type QueryValidationInputParam } from '../../validation/models/QueryValidationInputParam.js';
import { validatedInputParamQueryType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';
import { ValidatedQuery } from './ValidatedQuery.js';

describe(ValidatedQuery, () => {
  describe('when called', () => {
    let result: ParameterDecorator;

    beforeAll(() => {
      result = ValidatedQuery();
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
    ) => Promise<QueryValidationInputParam>;

    beforeAll(() => {
      vitest
        .mocked(createCustomParameterDecorator)
        .mockReturnValueOnce(vitest.fn());

      const decorator: ParameterDecorator = ValidatedQuery();

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

    describe('when called, and getQuery() returns a valid object', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let queriesFixture: Record<string, string[]>;
      let methodFixture: string;
      let urlFixture: string;
      let pathFixture: string;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();
        queriesFixture = { page: ['1'], search: ['foo'] };
        methodFixture = 'GET';
        urlFixture = '/items?page=1&search=foo';
        pathFixture = '/items';

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);

        result = await handler(requestFixture, responseFixture, {
          getBody: vitest.fn(),
          getCookies: vitest.fn(),
          getHeaders: vitest.fn(),
          getMethod: vitest.fn().mockReturnValueOnce(methodFixture),
          getParams: vitest.fn(),
          getQuery: vitest.fn().mockReturnValueOnce(queriesFixture),
          getUrl: vitest.fn().mockReturnValueOnce(urlFixture),
          setHeader: vitest.fn(),
          setStatus: vitest.fn(),
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPath()', () => {
        expect(getPath).toHaveBeenCalledExactlyOnceWith(urlFixture);
      });

      it('should return a QueryValidationInputParam', () => {
        const expected: QueryValidationInputParam = {
          method: methodFixture.toLowerCase(),
          path: pathFixture,
          queries: queriesFixture,
          type: validatedInputParamQueryType,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and getQuery() returns null', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();

        try {
          await handler(requestFixture, responseFixture, {
            getBody: vitest.fn(),
            getCookies: vitest.fn(),
            getHeaders: vitest.fn(),
            getMethod: vitest.fn().mockReturnValueOnce('GET'),
            getParams: vitest.fn(),
            getQuery: vitest.fn().mockReturnValueOnce(null),
            getUrl: vitest.fn().mockReturnValueOnce('/items'),
            setHeader: vitest.fn(),
            setStatus: vitest.fn(),
          });
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.unknown,
          message: expect.stringContaining(
            'Expected query to be a non array object',
          ),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getQuery() returns an array', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();

        try {
          await handler(requestFixture, responseFixture, {
            getBody: vitest.fn(),
            getCookies: vitest.fn(),
            getHeaders: vitest.fn(),
            getMethod: vitest.fn().mockReturnValueOnce('POST'),
            getParams: vitest.fn(),
            getQuery: vitest.fn().mockReturnValueOnce(['foo', 'bar']),
            getUrl: vitest.fn().mockReturnValueOnce('/items'),
            setHeader: vitest.fn(),
            setStatus: vitest.fn(),
          });
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.unknown,
          message: expect.stringContaining(
            'Expected query to be a non array object',
          ),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getQuery() returns a string', () => {
      let requestFixture: unknown;
      let responseFixture: unknown;
      let result: unknown;

      beforeAll(async () => {
        requestFixture = Symbol();
        responseFixture = Symbol();

        try {
          await handler(requestFixture, responseFixture, {
            getBody: vitest.fn(),
            getCookies: vitest.fn(),
            getHeaders: vitest.fn(),
            getMethod: vitest.fn().mockReturnValueOnce('GET'),
            getParams: vitest.fn(),
            getQuery: vitest.fn().mockReturnValueOnce('not-an-object'),
            getUrl: vitest.fn().mockReturnValueOnce('/items'),
            setHeader: vitest.fn(),
            setStatus: vitest.fn(),
          });
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.unknown,
          message: expect.stringContaining(
            'Expected query to be a non array object',
          ),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
