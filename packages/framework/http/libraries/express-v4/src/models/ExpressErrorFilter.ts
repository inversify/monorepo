import { ErrorFilter } from '@inversifyjs/http-core';
import express from 'express';

export type ExpressErrorFilter<TError = unknown> = ErrorFilter<
  TError,
  express.Request,
  express.Response,
  void
>;
