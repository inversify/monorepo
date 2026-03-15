import { type Interceptor } from '@inversifyjs/http-core';
import type express from 'express';

export type ExpressInterceptor = Interceptor<express.Request, express.Response>;
