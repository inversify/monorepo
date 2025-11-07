import {
  type FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import { HttpAdapterOptions } from '@inversifyjs/http-core';

export interface FastifyHttpAdapterOptions extends HttpAdapterOptions {
  useCookies?: boolean;
  useFormUrlEncoded?: boolean;
  useMultipartFormData?:
    | boolean
    | FastifyMultipartAttachFieldsToBodyOptions
    | FastifyMultipartOptions;
}
