import { type HttpRequest, type RecognizedString } from 'uWebSockets.js';

import { capturedRequestValuesSymbol } from '../data/capturedRequestValuesSymbol.js';
import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { RequestValueKind } from '../models/RequestValueKind.js';
import { stringifyRecognizedString } from './stringifyRecognizedString.js';

const EMPTY_HEADER_VALUE: string = '';

function buildNotCapturedError(
  requestApiName: string,
  requestValueKind: RequestValueKind,
): Error {
  return new Error(
    `Unable to call "${requestApiName}()" on a captured uWebSockets.js request: "${requestValueKind}" request values were not captured. Include "${requestValueKind}" in the @CaptureRequestValues() options.`,
  );
}

function buildCapturedRequestApi(
  capturedRequestValues: CapturedRequestValues,
): Record<string, unknown> {
  return {
    forEach: (callback: (key: string, value: string) => void): void => {
      if (capturedRequestValues.headers === undefined) {
        throw buildNotCapturedError('forEach', RequestValueKind.Headers);
      }

      for (const [key, value] of Object.entries(
        capturedRequestValues.headers,
      )) {
        callback(key, value);
      }
    },
    getCaseSensitiveMethod: (): string => {
      if (capturedRequestValues.caseSensitiveMethod === undefined) {
        throw buildNotCapturedError(
          'getCaseSensitiveMethod',
          RequestValueKind.Method,
        );
      }

      return capturedRequestValues.caseSensitiveMethod;
    },
    getHeader: (lowerCaseKey: RecognizedString): string => {
      if (capturedRequestValues.headers === undefined) {
        throw buildNotCapturedError('getHeader', RequestValueKind.Headers);
      }

      return (
        capturedRequestValues.headers[
          stringifyRecognizedString(lowerCaseKey)
        ] ?? EMPTY_HEADER_VALUE
      );
    },
    getMethod: (): string => {
      if (capturedRequestValues.method === undefined) {
        throw buildNotCapturedError('getMethod', RequestValueKind.Method);
      }

      return capturedRequestValues.method;
    },
    getParameter: (index: number | RecognizedString): string | undefined => {
      if (capturedRequestValues.params === undefined) {
        throw buildNotCapturedError('getParameter', RequestValueKind.Params);
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
        throw buildNotCapturedError('getQuery', RequestValueKind.Query);
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
        throw buildNotCapturedError('getUrl', RequestValueKind.Url);
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
  request: HttpRequest,
  capturedRequestValues: CapturedRequestValues,
): HttpRequest {
  const capturedRequestApi: Record<string, unknown> = buildCapturedRequestApi(
    capturedRequestValues,
  );

  return new Proxy(request, {
    get: (
      target: HttpRequest,
      property: string | symbol,
      receiver: unknown,
    ): unknown => {
      if (property === capturedRequestValuesSymbol) {
        return capturedRequestValues;
      }

      if (
        typeof property === 'string' &&
        Object.hasOwn(capturedRequestApi, property)
      ) {
        return capturedRequestApi[property];
      }

      return Reflect.get(target, property, receiver);
    },
    set: (
      target: HttpRequest,
      property: string | symbol,
      value: unknown,
      receiver: unknown,
    ): boolean => Reflect.set(target, property, value, receiver),
  });
}
