import { type HttpRequest, type RecognizedString } from 'uWebSockets.js';

import { capturedRequestValuesSymbol } from '../data/capturedRequestValuesSymbol.js';
import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type RequestValueKind } from '../models/RequestValueKind.js';
import { stringifyRecognizedString } from './stringifyRecognizedString.js';

const EMPTY_HEADER_VALUE: string = '';

function buildNotCapturedError(
  requestApiName: string,
  requestValueKind: RequestValueKind,
): Error {
  return new Error(
    `Unable to call "${requestApiName}()" on a captured uWebSockets.js request: "${requestValueKind}" request values were not captured. Include "${requestValueKind}" in the @CaptureRequestValues() request value kind list.`,
  );
}

function buildCapturedRequestApi(
  capturedRequestValues: CapturedRequestValues,
): Record<string, unknown> {
  return {
    forEach: (callback: (key: string, value: string) => void): void => {
      if (capturedRequestValues.headers === undefined) {
        throw buildNotCapturedError('forEach', 'headers');
      }

      for (const [key, value] of Object.entries(
        capturedRequestValues.headers,
      )) {
        callback(key, value);
      }
    },
    getCaseSensitiveMethod: (): string => {
      if (capturedRequestValues.caseSensitiveMethod === undefined) {
        throw buildNotCapturedError('getCaseSensitiveMethod', 'method');
      }

      return capturedRequestValues.caseSensitiveMethod;
    },
    getHeader: (lowerCaseKey: RecognizedString): string => {
      if (capturedRequestValues.headers === undefined) {
        throw buildNotCapturedError('getHeader', 'headers');
      }

      return (
        capturedRequestValues.headers[
          stringifyRecognizedString(lowerCaseKey)
        ] ?? EMPTY_HEADER_VALUE
      );
    },
    getMethod: (): string => {
      if (capturedRequestValues.method === undefined) {
        throw buildNotCapturedError('getMethod', 'method');
      }

      return capturedRequestValues.method;
    },
    getParameter: (index: number | RecognizedString): string | undefined => {
      if (capturedRequestValues.params === undefined) {
        throw buildNotCapturedError('getParameter', 'params');
      }

      const paramName: string | undefined =
        typeof index === 'number'
          ? capturedRequestValues.paramNameList?.[index]
          : stringifyRecognizedString(index);

      if (paramName === undefined) {
        return undefined;
      }

      return capturedRequestValues.params[paramName];
    },
    getQuery: (key?: string): string | undefined => {
      if (capturedRequestValues.query === undefined) {
        throw buildNotCapturedError('getQuery', 'query');
      }

      if (key === undefined) {
        return capturedRequestValues.query;
      }

      return (
        new URLSearchParams(capturedRequestValues.query).get(key) ?? undefined
      );
    },
    getUrl: (): string => {
      if (capturedRequestValues.url === undefined) {
        throw buildNotCapturedError('getUrl', 'url');
      }

      return capturedRequestValues.url;
    },
    setYield: (): HttpRequest => {
      throw new Error(
        'Unable to call "setYield()" on a captured uWebSockets.js request. Yielding a route is not supported once request values have been captured.',
      );
    },
  };
}

export function buildCapturedRequest(
  capturedRequestValues: CapturedRequestValues,
): HttpRequest {
  const capturedRequestApi: Record<string, unknown> = buildCapturedRequestApi(
    capturedRequestValues,
  );

  const capturedRequestTarget: Record<string | symbol, unknown> = {
    [capturedRequestValuesSymbol]: capturedRequestValues,
  };

  return new Proxy(capturedRequestTarget, {
    get: (
      target: Record<string | symbol, unknown>,
      property: string | symbol,
      receiver: unknown,
    ): unknown => {
      if (
        !Reflect.has(target, property) &&
        typeof property === 'string' &&
        Object.hasOwn(capturedRequestApi, property)
      ) {
        return capturedRequestApi[property];
      }

      return Reflect.get(target, property, receiver);
    },
    set: (
      target: Record<string | symbol, unknown>,
      property: string | symbol,
      value: unknown,
    ): boolean => Reflect.set(target, property, value),
  }) as unknown as HttpRequest;
}
