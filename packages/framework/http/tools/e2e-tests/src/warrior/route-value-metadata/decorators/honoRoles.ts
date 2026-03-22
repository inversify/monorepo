import { createRouteValueMetadataUtils } from '@inversifyjs/http-hono';
import { type Context } from 'hono';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (context: Context) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
