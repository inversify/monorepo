import { createRouteValueMetadataUtils } from '@inversifyjs/http-express';
import { type Request } from 'express';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: Request) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
