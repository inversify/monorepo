import { BetterAuthOptions } from 'better-auth';
import { Newable } from 'inversify';

import { buildBetterAuthExpressController } from '../calculations/buildBetterAuthExpressController';
import { BetterAuth } from '../models/BetterAuth';
import { BaseBetterAuthContainerModule } from './BaseBetterAuthContainerModule';

export class BetterAuthExpressContainerModule<
  TOptions extends BetterAuthOptions,
  TFactory extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => BetterAuth<TOptions> | Promise<BetterAuth<TOptions>>,
> extends BaseBetterAuthContainerModule<TOptions, TFactory> {
  public static fromOptions<TOptions extends BetterAuthOptions>(
    basePath: string,
    betterAuth: BetterAuth<TOptions>,
    transform?: (controllerClass: Newable<unknown>) => Newable<unknown>,
  ): BetterAuthExpressContainerModule<TOptions, () => BetterAuth<TOptions>> {
    return new BetterAuthExpressContainerModule(
      basePath,
      () => betterAuth,
      [],
      transform,
    );
  }

  protected override _buildBetterAuthControllerClass(
    basePath: string,
    serviceIdentifier: symbol,
  ): Newable<unknown> {
    return buildBetterAuthExpressController(basePath, serviceIdentifier);
  }
}
