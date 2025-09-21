import { createCustomParameterDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromFastifyRequest } from '../calculations/buildUserSessionFromFastifyRequest';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function FastifyUserSession(): ParameterDecorator {
  return createCustomParameterDecorator(buildUserSessionFromFastifyRequest);
}
