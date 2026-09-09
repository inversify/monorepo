import { type SourceImport } from './BootstrapSourceModel.js';

/**
 * Declarative model for the generated container initialization source file.
 * Bootstrap imports `initializeContainer` to load the runtime app container.
 */
export interface InitializeContainerSourceModel {
  /**
   * Extra statements inside `initializeContainer` after loading the config
   * module, before the return. Useful for `container.load(...)`.
   */
  initializeContainerBodyStatements?: readonly string[];
  imports: readonly SourceImport[];
}
