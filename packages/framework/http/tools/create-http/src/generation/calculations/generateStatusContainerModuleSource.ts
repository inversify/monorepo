export function generateStatusContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { StatusV1FromStatusBuilder } from '../../../api/builders/StatusV1FromStatusBuilder.js';
import { StatusController } from '../../../api/controllers/StatusController.js';

export class StatusContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(StatusController).toSelf().inSingletonScope();
      options.bind(StatusV1FromStatusBuilder).toSelf().inSingletonScope();
    });
  }
}
`;
}
