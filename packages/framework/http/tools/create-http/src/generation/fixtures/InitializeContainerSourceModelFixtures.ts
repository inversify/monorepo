import { createInitializeContainerSourceModel } from '../calculations/createInitializeContainerSourceModel.js';
import { type InitializeContainerSourceModel } from '../models/InitializeContainerSourceModel.js';

export class InitializeContainerSourceModelFixtures {
  public static get withDbAdapterPrismaPostgresql(): InitializeContainerSourceModel {
    return createInitializeContainerSourceModel();
  }

  public static get withUseCaseExtraInitializeContainerBodyStatements(): InitializeContainerSourceModel {
    return {
      imports: [
        {
          moduleSpecifier: 'inversify',
          namedImports: [{ name: 'Container' }],
        },
      ],
      initializeContainerBodyStatements: [
        'container.load(new UserContainerModule());',
      ],
    };
  }
}
