import { type SourceImport } from './BootstrapSourceModel.js';

/**
 * Options mirrored from `@inversifyjs/http-uwebsockets` `CaptureRequestValuesOptions`.
 * Only the fields the scaffolder needs are modeled.
 */
export interface CaptureRequestValuesSourceModel {
  headers?: boolean;
  method?: boolean;
  params?: false | readonly string[];
  query?: boolean;
  url?: boolean;
}

export type TodoControllerMethodName =
  'createTodo' | 'deleteTodo' | 'getTodo' | 'listTodos' | 'updateTodo';

/**
 * Declarative model for the generated TodoController source file.
 * Adapter-specific capture decorators live here so the printer stays free of
 * `if (adapter === ...)` branches.
 */
export interface TodoControllerSourceModel {
  /**
   * Extra imports (e.g. `CaptureRequestValues` for uwebsockets).
   */
  imports: readonly SourceImport[];
  /**
   * Per-method `@CaptureRequestValues` options. Empty when the adapter does
   * not require request-value capture before awaits.
   */
  methodCaptureRequestValues: Readonly<
    Partial<Record<TodoControllerMethodName, CaptureRequestValuesSourceModel>>
  >;
}
