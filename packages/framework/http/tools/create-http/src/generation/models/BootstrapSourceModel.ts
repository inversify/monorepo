export interface SourceNamedImport {
  alias?: string;
  isTypeOnly?: boolean;
  name: string;
}

export interface SourceImport {
  defaultImport?: string;
  isTypeOnly?: boolean;
  moduleSpecifier: string;
  namedImports?: readonly SourceNamedImport[];
  namespaceImport?: string;
}

interface BootstrapAdapterModel {
  /**
   * Fully typed adapter class name, e.g. `InversifyExpressHttpAdapter`.
   */
  className: string;
  /**
   * Object literal passed as the second constructor argument.
   * Example: `{ logger: true, useJson: true }`.
   */
  optionsObjectLiteral: string;
}

/**
 * Declarative model for the generated bootstrap source file.
 * Future contributors can extend this (container modules, pipes, adapters)
 * without rewriting the printer.
 */
export interface BootstrapSourceModel {
  adapter: BootstrapAdapterModel;
  /**
   * Type annotation for `const app: T = await adapter.build()`.
   * Omit to let TypeScript infer the type (useful for uWebSockets).
   */
  applicationType?: string;
  /**
   * Extra statements inside `initializeContainer` after `new Container()`,
   * before the return. Useful for `container.load(...)`, pipe registration, etc.
   */
  initializeContainerBodyStatements?: readonly string[];
  imports: readonly SourceImport[];
  /**
   * Statements after `const app = await adapter.build()`.
   * `app` and `PORT` (from `ConfigService`) are in scope.
   */
  listenStatements: readonly string[];
}
