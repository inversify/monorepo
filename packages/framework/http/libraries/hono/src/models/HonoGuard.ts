import { Guard } from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

export type HonoGuard = Guard<HonoRequest>;
