import { Guard } from '@inversifyjs/http-core';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulGuard implements Guard {
  public async activate(): Promise<boolean> {
    return false;
  }
}
