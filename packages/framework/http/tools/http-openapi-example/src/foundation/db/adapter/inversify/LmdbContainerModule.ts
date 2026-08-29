import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { open } from 'lmdb';
import { resolve } from 'rflct';

import type { LmdbDb } from '../../domain/models/lmdbDbServiceIdentifier.js';

export class LmdbContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(resolve<LmdbDb>()).toConstantValue(
        open({
          path: 'my-db',
        }),
      );
    });
  }
}
