export function generateStatusContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { StatusController } from '../controllers/StatusController.js';

export class StatusContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(StatusController).toSelf().inSingletonScope();
    });
  }
}
`;
}
