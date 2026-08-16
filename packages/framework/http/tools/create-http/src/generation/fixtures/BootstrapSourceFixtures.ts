import { generateBootstrapSource } from '../calculations/generateBootstrapSource.js';
import { BootstrapSourceModelFixtures } from './BootstrapSourceModelFixtures.js';

export class BootstrapSourceFixtures {
  public static async withHttpAdapterExpress(): Promise<string> {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterExpress,
    );
  }

  public static async withHttpAdapterFastify(): Promise<string> {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterFastify,
    );
  }

  public static async withHttpAdapterHono(): Promise<string> {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterHono,
    );
  }

  public static async withHttpAdapterUwebsockets(): Promise<string> {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterUwebsockets,
    );
  }

  public static async withUseCaseExtraInitializeContainerBodyStatements(): Promise<string> {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withUseCaseExtraInitializeContainerBodyStatements,
    );
  }
}
