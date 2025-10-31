import { ErrorFilter } from '@inversifyjs/framework-core';

import { ErrorHttpResponse } from '../../httpResponse/models/ErrorHttpResponse';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpStatusCode } from '../models/HttpStatusCode';

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
