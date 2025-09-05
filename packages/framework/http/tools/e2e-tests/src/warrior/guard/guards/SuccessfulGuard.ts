import { Guard } from '@inversifyjs/http-core';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulGuard implements Guard {
  public async activate(): Promise<boolean> {
    return true;
  }
}
