import { beforeAll, describe, expect, it } from 'vitest';

import { routeValueMetadataSymbol } from '@inversifyjs/http-core';
import { type HttpRequest } from 'uWebSockets.js';

import { capturedRequestValuesSymbol } from '../data/capturedRequestValuesSymbol.js';
import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';

function buildCapturedRequestValues(
  capturedRequestValues: Partial<CapturedRequestValues>,
): CapturedRequestValues {
  return {
    body: undefined,
    caseSensitiveMethod: undefined,
    headers: undefined,
    method: undefined,
    paramNameList: undefined,
    params: undefined,
    query: undefined,
    url: undefined,
    ...capturedRequestValues,
  };
}

describe(buildCapturedRequest, () => {
  describe('having captured request values for every request value kind', () => {
    let capturedRequestValuesFixture: CapturedRequestValues;
    let capturedRequest: HttpRequest;

    beforeAll(() => {
      capturedRequestValuesFixture = buildCapturedRequestValues({
        body: { value: { name: 'warrior' } },
        caseSensitiveMethod: 'POST',
        headers: { 'content-type': 'application/json' },
        method: 'post',
        paramNameList: ['userId', 'itemId'],
        params: { itemId: 'item-1', userId: 'user-1' },
        query: 'first=1&second=2',
        url: '/users/user-1/items/item-1',
      });

      capturedRequest = buildCapturedRequest(capturedRequestValuesFixture);
    });

    describe('when getMethod() is called', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getMethod();
      });

      it('should return the captured method', () => {
        expect(result).toBe('post');
      });
    });

    describe('when getCaseSensitiveMethod() is called', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getCaseSensitiveMethod();
      });

      it('should return the captured case sensitive method', () => {
        expect(result).toBe('POST');
      });
    });

    describe('when getHeader() is called with a captured header', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getHeader('content-type');
      });

      it('should return the captured header value', () => {
        expect(result).toBe('application/json');
      });
    });

    describe('when getHeader() is called with an unknown header', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getHeader('x-unknown');
      });

      it('should return an empty string', () => {
        expect(result).toBe('');
      });
    });

    describe('when forEach() is called', () => {
      let result: [string, string][];

      beforeAll(() => {
        result = [];

        capturedRequest.forEach((key: string, value: string): void => {
          result.push([key, value]);
        });
      });

      it('should iterate over the captured headers', () => {
        expect(result).toStrictEqual([['content-type', 'application/json']]);
      });
    });

    describe('when getParameter() is called with a param name', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getParameter('userId');
      });

      it('should return the captured param value', () => {
        expect(result).toBe('user-1');
      });
    });

    describe('when getParameter() is called with a param index', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getParameter(1);
      });

      it('should return the captured param value', () => {
        expect(result).toBe('item-1');
      });
    });

    describe('when getParameter() is called with an unknown param index', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getParameter(42);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when getQuery() is called', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getQuery();
      });

      it('should return the captured raw query', () => {
        expect(result).toBe('first=1&second=2');
      });
    });

    describe('when getQuery() is called with a key', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getQuery('second');
      });

      it('should return the captured query value', () => {
        expect(result).toBe('2');
      });
    });

    describe('when getQuery() is called with an unknown key', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getQuery('third');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when getUrl() is called', () => {
      let result: unknown;

      beforeAll(() => {
        result = capturedRequest.getUrl();
      });

      it('should return the captured url', () => {
        expect(result).toBe('/users/user-1/items/item-1');
      });
    });

    describe('when setYield() is called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          capturedRequest.setYield(true);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toContain(
          'Unable to call "setYield()" on a captured uWebSockets.js request',
        );
      });
    });

    describe('when a symbol property is set', () => {
      let routeValueMetadataMapFixture: Map<string | symbol, unknown>;
      let result: unknown;

      beforeAll(() => {
        routeValueMetadataMapFixture = new Map([['ROLES', ['admin']]]);

        (
          capturedRequest as HttpRequest & {
            [routeValueMetadataSymbol]?: Map<string | symbol, unknown>;
          }
        )[routeValueMetadataSymbol] = routeValueMetadataMapFixture;

        result = (
          capturedRequest as HttpRequest & {
            [routeValueMetadataSymbol]?: Map<string | symbol, unknown>;
          }
        )[routeValueMetadataSymbol];
      });

      it('should return the assigned value', () => {
        expect(result).toBe(routeValueMetadataMapFixture);
      });
    });

    describe('when the captured request values symbol is read', () => {
      let result: unknown;

      beforeAll(() => {
        result = (
          capturedRequest as HttpRequest & {
            [capturedRequestValuesSymbol]?: CapturedRequestValues;
          }
        )[capturedRequestValuesSymbol];
      });

      it('should return the captured request values', () => {
        expect(result).toBe(capturedRequestValuesFixture);
      });
    });
  });

  describe('having captured request values with method only', () => {
    let capturedRequest: HttpRequest;

    beforeAll(() => {
      capturedRequest = buildCapturedRequest(
        buildCapturedRequestValues({
          caseSensitiveMethod: 'GET',
          method: 'get',
        }),
      );
    });

    describe.each([
      ['forEach', (request: HttpRequest): unknown => request.forEach(() => {})],
      ['getHeader', (request: HttpRequest): unknown => request.getHeader('x')],
      [
        'getParameter',
        (request: HttpRequest): unknown => request.getParameter('userId'),
      ],
      ['getQuery', (request: HttpRequest): unknown => request.getQuery()],
      ['getUrl', (request: HttpRequest): unknown => request.getUrl()],
    ])(
      'when %s() is called for a request value kind that was not captured',
      (_requestApiName: string, call: (request: HttpRequest) => unknown) => {
        let result: unknown;

        beforeAll(() => {
          try {
            call(capturedRequest);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error stating the value was not captured', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).message).toContain(
            'request values were not captured',
          );
        });
      },
    );
  });
});
