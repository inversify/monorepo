import { type BetterAuthOptions } from 'better-auth';
import { type Newable } from 'inversify';

import { buildBetterAuthFastifyController } from '../calculations/buildBetterAuthFastifyController.js';
import { type BetterAuth } from '../models/BetterAuth.js';
import { BaseBetterAuthContainerModule } from './BaseBetterAuthContainerModule.js';

export class BetterAuthFastifyContainerModule<
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
  ): BetterAuthFastifyContainerModule<TOptions, () => BetterAuth<TOptions>> {
    return new BetterAuthFastifyContainerModule(
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
    return buildBetterAuthFastifyController(basePath, serviceIdentifier);
  }
}
