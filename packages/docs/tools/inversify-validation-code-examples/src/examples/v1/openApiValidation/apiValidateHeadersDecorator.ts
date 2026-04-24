// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';
import { ValidatedHeaders } from '@inversifyjs/open-api-validation';

interface ResourceHeaders {
  'x-page-size'?: number;
  'x-request-id': string;
}

@Controller('/resources')
export class ResourceController {
  @OasParameter({
    in: 'header',
    name: 'x-request-id',
    required: true,
    schema: { type: 'string' },
  })
  @OasParameter({
    in: 'header',
    name: 'x-page-size',
    required: false,
    schema: { minimum: 1, type: 'integer' },
  })
  @Get('/')
  public getResources(@ValidatedHeaders() headers: ResourceHeaders): string {
    return `Request ID: ${headers['x-request-id']}`;
  }
}
