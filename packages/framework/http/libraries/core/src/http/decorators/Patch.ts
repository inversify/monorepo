import { requestMethod } from '../calculations/requestMethod.js';
import { RequestMethodType } from '../models/RequestMethodType.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Patch: (path?: string) => (value: Function, context: ClassMethodDecoratorContext) => void = (
  path?: string,
): (value: Function, context: ClassMethodDecoratorContext) => void => requestMethod(RequestMethodType.Patch, path);
