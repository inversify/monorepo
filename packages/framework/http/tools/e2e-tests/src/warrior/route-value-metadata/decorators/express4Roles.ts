import { createRouteValueMetadataUtils } from '@inversifyjs/http-express-v4';
import { type Request } from 'express4';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: Request) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
