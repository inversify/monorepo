import { HttpAdapterOptions } from '@inversifyjs/http-core';

export interface FastifyHttpAdapterOptions extends HttpAdapterOptions {
  useCookies?: boolean;
}
