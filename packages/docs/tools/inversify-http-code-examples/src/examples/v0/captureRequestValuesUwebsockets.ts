// Begin-example
import {
  Body,
  Controller,
  Headers,
  Params,
  Post,
} from '@inversifyjs/http-core';
import { CaptureRequestValues } from '@inversifyjs/http-uwebsockets';

export interface AuditBody {
  action: string;
}

export interface AuditEntry {
  action: string;
  storeId: string;
  userAgent: string | string[] | undefined;
  userId: string;
}

@Controller('/store/:storeId/users')
export class StoreUsersController {
  @CaptureRequestValues({
    headers: true,
    params: ['storeId', 'userId'],
  })
  @Post('/:userId/audit')
  public async createUserAudit(
    @Body() body: AuditBody,
    @Headers({ name: 'user-agent' }) userAgent: string | string[] | undefined,
    @Params({ name: 'storeId' }) storeId: string,
    @Params({ name: 'userId' }) userId: string,
  ): Promise<AuditEntry> {
    return {
      action: body.action,
      storeId,
      userAgent,
      userId,
    };
  }
}
// End-example
