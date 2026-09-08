import { type SourceImport } from './BootstrapSourceModel.js';
import { type OpenApiSchemaBindingKind } from './OpenApiSchemaBindingKind.js';

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

export interface SetHeaderSourceModel {
  headerKey: string;
  value: string;
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
   * Request/response TypeScript types. Class models for code-first, generated
   * `src/generated/api` types for schema-first.
   */
  apiTypeImports: readonly SourceImport[];
  /**
   * Extra imports (e.g. `CaptureRequestValues` for uwebsockets).
   */
  imports: readonly SourceImport[];
  /**
   * How named schemas are attached to `@OasRequestBody` / `@OasResponse`.
   */
  openApiSchemaBindingKind: OpenApiSchemaBindingKind;
  /**
   * Per-method `@CaptureRequestValues` options. Empty when the adapter does
   * not require request-value capture before awaits.
   */
  methodCaptureRequestValues: Readonly<
    Partial<Record<TodoControllerMethodName, CaptureRequestValuesSourceModel>>
  >;
  /**
   * Per-method `@SetHeader` pairs. Empty when the adapter sets response
   * content type on JSON replies by itself.
   */
  methodHeaders: Readonly<
    Partial<Record<TodoControllerMethodName, readonly SetHeaderSourceModel[]>>
  >;
}
