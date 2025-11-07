import { HttpAdapterOptions } from '@inversifyjs/http-core';

export interface ExpressHttpAdapterOptions extends HttpAdapterOptions {
  useCookies?: boolean;
  useJson?: boolean;
  useText?: boolean;
  useUrlEncoded?: boolean;
}
