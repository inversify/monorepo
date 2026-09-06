import { type SourceImport } from './BootstrapSourceModel.js';

/**
 * Declarative model for the generated container initialization source file.
 * Bootstrap and OpenAPI type generation both import `initializeContainer`.
 */
export interface InitializeContainerSourceModel {
  /**
   * Extra statements inside `initializeContainer` after loading the config
   * module, before the return. Useful for `container.load(...)`.
   */
  initializeContainerBodyStatements?: readonly string[];
  imports: readonly SourceImport[];
}
