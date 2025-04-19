import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';

export const HEAD: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.HEAD, path);
