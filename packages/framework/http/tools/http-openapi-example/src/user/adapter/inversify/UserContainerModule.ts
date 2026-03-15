import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { UserController } from '../../api/controllers/UserController.js';
import { UserService } from '../../domain/services/UserService.js';

export class UserContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(UserController).toSelf().inSingletonScope();
      options.bind(UserService).toSelf().inSingletonScope();
    });
  }
}
