import { type ErrorFilter } from '@inversifyjs/http-core';
import type express from 'express';

export type ExpressErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  express.Request,
  express.Response,
  void
>;
