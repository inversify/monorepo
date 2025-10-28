import { Interceptor } from '@inversifyjs/http-core';
import express from 'express';

export type ExpressInterceptor = Interceptor<express.Request, express.Response>;
