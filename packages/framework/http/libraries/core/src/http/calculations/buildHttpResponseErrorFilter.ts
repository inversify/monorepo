import { type ErrorFilter } from '@inversifyjs/framework-core';

import { type ErrorHttpResponse } from '../../httpResponse/models/ErrorHttpResponse.js';
import { type ControllerResponse } from '../models/ControllerResponse.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function buildHttpResponseErrorFilter<TRequest, TResponse, TResult>(
  reply: (
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
    statusCode?: HttpStatusCode,
  ) => TResult,
): ErrorFilter<ErrorHttpResponse> {
  return {
    catch(
      error: ErrorHttpResponse,
      request: TRequest,
      response: TResponse,
    ): TResult {
      return reply(request, response, error);
    },
  };
}
