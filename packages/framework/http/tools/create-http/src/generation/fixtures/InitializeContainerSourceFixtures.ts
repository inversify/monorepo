import { generateInitializeContainerSource } from '../calculations/generateInitializeContainerSource.js';
import { InitializeContainerSourceModelFixtures } from './InitializeContainerSourceModelFixtures.js';

export class InitializeContainerSourceFixtures {
  public static async withDbAdapterPrismaPostgresql(): Promise<string> {
    return generateInitializeContainerSource(
      InitializeContainerSourceModelFixtures.withDbAdapterPrismaPostgresql,
    );
  }

  public static async withUseCaseExtraInitializeContainerBodyStatements(): Promise<string> {
    return generateInitializeContainerSource(
      InitializeContainerSourceModelFixtures.withUseCaseExtraInitializeContainerBodyStatements,
    );
  }
}
