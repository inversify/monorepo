import { BetterAuthOptions } from 'better-auth';
import {
  ContainerModule,
  ContainerModuleLoadOptions,
  Newable,
  ResolvedValueInjectOptions,
} from 'inversify';

import { buildBetterAuthMiddleware } from '../calculations/buildBetterAuthMiddleware';
import { BetterAuth } from '../models/BetterAuth';
import { betterAuthControllerServiceIdentifier } from '../models/betterAuthControllerServiceIdentifier';
import { betterAuthMiddlewareServiceIdentifier } from '../models/betterAuthMiddlewareServiceIdentifier';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier';

type MapToResolvedValueInjectOptions<TArgs extends unknown[]> = {
  [K in keyof TArgs]-?: ResolvedValueInjectOptions<TArgs[K]>;
};

export abstract class BaseBetterAuthContainerModule<
  TOptions extends BetterAuthOptions,
  TFactory extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => BetterAuth<TOptions> | Promise<BetterAuth<TOptions>>,
> extends ContainerModule {
  constructor(
    basePath: string,
    factory: TFactory,
    params: MapToResolvedValueInjectOptions<Parameters<TFactory>>,
  ) {
    super((containerModuleOptions: ContainerModuleLoadOptions) => {
      this.#provide(basePath, factory, params, containerModuleOptions);
    });
  }

  #provide(
    basePath: string,
    factory: TFactory,
    params: MapToResolvedValueInjectOptions<Parameters<TFactory>>,
    containerModuleOptions: ContainerModuleLoadOptions,
  ): void {
    containerModuleOptions
      .bind(betterAuthServiceIdentifier)
      .toResolvedValue(factory, params)
      .inSingletonScope();

    containerModuleOptions
      .bind(betterAuthMiddlewareServiceIdentifier)
      .toResolvedValue(
        (betterAuth: BetterAuth<TOptions>) =>
          new (buildBetterAuthMiddleware(betterAuth))(),
        [betterAuthServiceIdentifier],
      )
      .inSingletonScope();

    containerModuleOptions
      .bind(betterAuthControllerServiceIdentifier)
      .to(this._buildBetterAuthControllerClass(basePath))
      .inSingletonScope();
  }

  protected abstract _buildBetterAuthControllerClass(
    basePath: string,
  ): Newable<unknown>;
}
