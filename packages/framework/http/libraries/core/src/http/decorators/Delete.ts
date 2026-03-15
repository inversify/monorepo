import { requestMethod } from '../calculations/requestMethod.js';
import { RequestMethodType } from '../models/RequestMethodType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Delete: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.Delete, path);
