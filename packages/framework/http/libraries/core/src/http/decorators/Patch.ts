import { requestMethod } from '../calculations/requestMethod.js';
import { RequestMethodType } from '../models/RequestMethodType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Patch: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.Patch, path);
