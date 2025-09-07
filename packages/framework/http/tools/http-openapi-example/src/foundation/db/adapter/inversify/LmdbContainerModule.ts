import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { open } from 'lmdb';

import { lmdbDbServiceIdentifier } from '../../domain/models/lmdbDbServiceIdentifier';

export class LmdbContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(lmdbDbServiceIdentifier).toConstantValue(
        open({
          path: 'my-db',
        }),
      );
    });
  }
}
