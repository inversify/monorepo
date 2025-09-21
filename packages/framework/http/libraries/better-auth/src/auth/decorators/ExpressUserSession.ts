import { createCustomParameterDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromExpressRequest } from '../calculations/buildUserSessionFromExpressRequest';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ExpressUserSession(): ParameterDecorator {
  return createCustomParameterDecorator(buildUserSessionFromExpressRequest);
}
