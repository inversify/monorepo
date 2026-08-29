import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { resolve } from 'rflct';

import { UserPersistenceService } from '../../domain/services/UserPersistenceService.js';
import { LmdbUserRepository } from '../lmdb/repositories/LmdbUserRepository.js';

export class UserLmdbContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options
        .bind(resolve<UserPersistenceService>())
        .to(LmdbUserRepository)
        .inSingletonScope();
    });
  }
}
