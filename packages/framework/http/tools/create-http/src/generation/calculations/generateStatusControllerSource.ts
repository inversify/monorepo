export function generateStatusControllerSource(): string {
  return `import { Controller, Get } from '@inversifyjs/http-core';

import { type StatusResponse } from '../models/StatusResponse.js';

@Controller('/status')
export class StatusController {
  @Get()
  public async getStatus(): Promise<StatusResponse> {
    return {
      status: 'ok',
    };
  }
}
`;
}
