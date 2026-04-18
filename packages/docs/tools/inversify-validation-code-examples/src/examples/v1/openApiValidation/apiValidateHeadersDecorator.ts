// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';
import { ValidatedHeaders } from '@inversifyjs/open-api-validation';

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
  public getResources(
    @ValidatedHeaders() headers: Record<string, unknown>,
  ): string {
    return `Request ID: ${String(headers['x-request-id'])}`;
  }
}
