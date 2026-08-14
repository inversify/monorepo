export function generateTodoPrismaContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { todoPersistencePortIdentifier } from '../../../application/models/todoPersistencePortIdentifier.js';
import { PrismaTodoPersistenceAdapter } from '../../prisma/adapters/PrismaTodoPersistenceAdapter.js';
import { TodoFromPrismaTodoBuilder } from '../../prisma/builders/TodoFromPrismaTodoBuilder.js';

export class TodoPrismaContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(TodoFromPrismaTodoBuilder).toSelf().inSingletonScope();
      options
        .bind(todoPersistencePortIdentifier)
        .to(PrismaTodoPersistenceAdapter)
        .inSingletonScope();
    });
  }
}
`;
}
