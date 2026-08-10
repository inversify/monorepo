export function generateTodoPrismaContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { todoPersistencePortIdentifier } from '../../application/models/todoPersistencePortIdentifier.js';
import { PrismaTodoPersistenceAdapter } from '../prisma/PrismaTodoPersistenceAdapter.js';

export class TodoPrismaContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options
        .bind(todoPersistencePortIdentifier)
        .to(PrismaTodoPersistenceAdapter)
        .inSingletonScope();
    });
  }
}
`;
}
