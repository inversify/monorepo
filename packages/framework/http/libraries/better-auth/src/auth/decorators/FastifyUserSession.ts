import { createCustomParameterMethodDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromFastifyRequest } from '../calculations/buildUserSessionFromFastifyRequest.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function FastifyUserSession(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return createCustomParameterMethodDecorator(
    buildUserSessionFromFastifyRequest,
  )(paramName);
}
