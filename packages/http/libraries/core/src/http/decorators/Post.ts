import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';

export const POST: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.POST, path);
