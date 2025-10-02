import { BetterAuthOptions } from 'better-auth';
import { Newable } from 'inversify';

import { buildBetterAuthExpress4Controller } from '../calculations/buildBetterAuthExpress4Controller';
import { BetterAuth } from '../models/BetterAuth';
import { BaseBetterAuthContainerModule } from './BaseBetterAuthContainerModule';

export class BetterAuthExpress4ContainerModule<
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
  ): BetterAuthExpress4ContainerModule<TOptions, () => BetterAuth<TOptions>> {
    return new BetterAuthExpress4ContainerModule(
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
    return buildBetterAuthExpress4Controller(basePath, serviceIdentifier);
  }
}
