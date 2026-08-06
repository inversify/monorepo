import { generateBootstrapSource } from '../calculations/generateBootstrapSource.js';
import { BootstrapSourceModelFixtures } from './BootstrapSourceModelFixtures.js';

export class BootstrapSourceFixtures {
  public static get withHttpAdapterExpress(): string {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterExpress,
    );
  }

  public static get withHttpAdapterFastify(): string {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterFastify,
    );
  }

  public static get withHttpAdapterHono(): string {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterHono,
    );
  }

  public static get withHttpAdapterUwebsockets(): string {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withHttpAdapterUwebsockets,
    );
  }

  public static get withUseCaseExtraInitializeContainerBodyStatements(): string {
    return generateBootstrapSource(
      BootstrapSourceModelFixtures.withUseCaseExtraInitializeContainerBodyStatements,
    );
  }
}
