import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';

import { userPersistenceServiceServiceIdentifier } from '../../domain/models/userPersistenceServiceServiceIdentifier';
import { LmdbUserRepository } from '../lmdb/repositories/LmdbUserRepository';

export class UserLmdbContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options
        .bind(userPersistenceServiceServiceIdentifier)
        .to(LmdbUserRepository)
        .inSingletonScope();
    });
  }
}
