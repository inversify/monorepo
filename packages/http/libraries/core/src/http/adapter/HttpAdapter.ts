import { HttpResponse } from '../responses/HttpResponse';

export interface HttpAdapter<TRequest, TResponse> {
  replyHttpResponse(
    request: TRequest,
    response: TResponse,
    httpResponse: HttpResponse,
  ): unknown;
}
