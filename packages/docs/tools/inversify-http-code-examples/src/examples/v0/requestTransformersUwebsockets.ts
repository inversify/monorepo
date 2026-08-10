// Begin-example
import { Controller, Get, Request } from '@inversifyjs/http-core';
import {
  type RequestTransformer,
  UseRequestTransformers,
} from '@inversifyjs/http-uwebsockets';
import { type HttpRequest } from 'uWebSockets.js';

export interface TenantHttpRequest extends HttpRequest {
  tenantId: string;
}

// Transformers run before middlewares, guards and parameter extraction
const captureTenantId: RequestTransformer = (
  request: HttpRequest,
): HttpRequest => {
  const tenantHttpRequest: TenantHttpRequest = request as TenantHttpRequest;

  tenantHttpRequest.tenantId = request.getHeader('x-tenant-id');

  return tenantHttpRequest;
};

@Controller('/tenants')
export class TenantsController {
  @UseRequestTransformers(captureTenantId)
  @Get('/current')
  public async getCurrentTenant(
    @Request() request: TenantHttpRequest,
  ): Promise<string> {
    return request.tenantId;
  }
}
// End-example
