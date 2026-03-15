import { type Guard } from '@inversifyjs/http-core';
import { type HttpRequest } from 'uWebSockets.js';

export type UwebSocketsGuard = Guard<HttpRequest>;
