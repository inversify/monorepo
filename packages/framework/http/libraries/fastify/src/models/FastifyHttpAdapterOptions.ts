import {
  type FastifyMultipartAttachFieldsToBodyOptions,
  type FastifyMultipartOptions,
} from '@fastify/multipart';
import { type HttpAdapterOptions } from '@inversifyjs/http-core';

export interface FastifyHttpAdapterOptions extends HttpAdapterOptions {
  useCookies?: boolean;
  useFormUrlEncoded?: boolean;
  useMultipartFormData?:
    | boolean
    | FastifyMultipartAttachFieldsToBodyOptions
    | FastifyMultipartOptions;
}
