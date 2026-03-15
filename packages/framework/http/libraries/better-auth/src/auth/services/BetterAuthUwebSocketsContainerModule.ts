import { type BetterAuthOptions } from 'better-auth';
import { type Newable } from 'inversify';

import { buildBetterAuthUwebSocketsController } from '../calculations/buildBetterAuthUwebSocketsController.js';
import { type BetterAuth } from '../models/BetterAuth.js';
import { BaseBetterAuthContainerModule } from './BaseBetterAuthContainerModule.js';

export class BetterAuthUwebSocketsContainerModule<
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
  ): BetterAuthUwebSocketsContainerModule<
    TOptions,
    () => BetterAuth<TOptions>
  > {
    return new BetterAuthUwebSocketsContainerModule(
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
    return buildBetterAuthUwebSocketsController(basePath, serviceIdentifier);
  }
}
