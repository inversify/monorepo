import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

class UserTokenService {
  public extractUserInfo(_request: Request): void {}
}

// Begin-example
@injectable()
export class AuthMiddleware implements ExpressMiddleware {
  constructor(
    @inject(UserTokenService)
    private readonly userTokenService: UserTokenService,
  ) {}

  public execute(
    request: Request,
    _response: Response,
    next: NextFunction,
  ): void {
    this.userTokenService.extractUserInfo(request);
    next();
  }
}
// End-example
