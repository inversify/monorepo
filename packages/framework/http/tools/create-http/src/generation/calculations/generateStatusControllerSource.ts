export function generateStatusControllerSource(): string {
  return `import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
import {
  OasDescription,
  OasOperationId,
  OasResponse,
  OasSummary,
  OasTag,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';

import { StatusResponse } from '../models/StatusResponse.js';

@Controller('/status')
export class StatusController {
  @OasSummary('Get service status')
  @OasDescription('Returns the current health status of the service')
  @OasOperationId('getStatus')
  @OasTag('Status')
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(StatusResponse),
      },
    },
    description: 'Service is healthy',
  }))
  @Get()
  public async getStatus(): Promise<StatusResponse> {
    return {
      status: 'ok',
    };
  }
}
`;
}
