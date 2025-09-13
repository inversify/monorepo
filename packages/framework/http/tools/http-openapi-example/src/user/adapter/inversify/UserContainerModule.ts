import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';

import { UserController } from '../../api/controllers/UserController';
import { UserService } from '../../domain/services/UserService';

export class UserContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(UserController).toSelf().inSingletonScope();
      options.bind(UserService).toSelf().inSingletonScope();
    });
  }
}
