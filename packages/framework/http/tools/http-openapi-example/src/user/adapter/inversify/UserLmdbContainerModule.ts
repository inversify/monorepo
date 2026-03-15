import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { userPersistenceServiceServiceIdentifier } from '../../domain/models/userPersistenceServiceServiceIdentifier.js';
import { LmdbUserRepository } from '../lmdb/repositories/LmdbUserRepository.js';

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
