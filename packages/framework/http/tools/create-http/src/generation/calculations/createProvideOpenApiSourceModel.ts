import { ApiStyle } from '../../models/ApiStyle.js';
import { type ProvideOpenApiSourceModel } from '../models/ProvideOpenApiSourceModel.js';

export function createProvideOpenApiSourceModel(
  apiStyle: ApiStyle,
): ProvideOpenApiSourceModel {
  if (apiStyle !== ApiStyle.schemaFirst) {
    return {
      componentSchemas: [],
      schemaImports: [],
    };
  }

  return {
    componentSchemas: [
      {
        identifier: 'createTodoV1RequestBodySchema',
        name: 'CreateTodoV1RequestBody',
      },
      {
        identifier: 'paginatedTodosV1ResponseSchema',
        name: 'PaginatedTodosV1Response',
      },
      {
        identifier: 'statusSchemaV1',
        name: 'StatusV1',
      },
      {
        identifier: 'todoSchemaV1',
        name: 'TodoV1',
      },
      {
        identifier: 'updateTodoV1RequestBodySchema',
        name: 'UpdateTodoV1RequestBody',
      },
    ],
    schemaImports: [
      {
        moduleSpecifier: '../../status/api/models/StatusSchemaV1.js',
        namedImports: [{ name: 'statusSchemaV1' }],
      },
      {
        moduleSpecifier:
          '../../todo/api/models/CreateTodoV1RequestBodySchema.js',
        namedImports: [{ name: 'createTodoV1RequestBodySchema' }],
      },
      {
        moduleSpecifier:
          '../../todo/api/models/PaginatedTodosV1ResponseSchema.js',
        namedImports: [{ name: 'paginatedTodosV1ResponseSchema' }],
      },
      {
        moduleSpecifier: '../../todo/api/models/TodoSchemaV1.js',
        namedImports: [{ name: 'todoSchemaV1' }],
      },
      {
        moduleSpecifier:
          '../../todo/api/models/UpdateTodoV1RequestBodySchema.js',
        namedImports: [{ name: 'updateTodoV1RequestBodySchema' }],
      },
    ],
  };
}
