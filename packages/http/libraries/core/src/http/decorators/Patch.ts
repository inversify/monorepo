import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';

export const PATCH: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.PATCH, path);
