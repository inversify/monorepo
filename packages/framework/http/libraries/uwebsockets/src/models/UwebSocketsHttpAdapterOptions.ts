import { HttpAdapterOptions } from '@inversifyjs/http-core';

export interface UwebSocketsHttpAdapterOptions extends HttpAdapterOptions {
  useJson?: boolean;
}
