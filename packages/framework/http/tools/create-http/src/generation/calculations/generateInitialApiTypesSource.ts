import { GENERATED_API_TYPE_NAMES } from '../models/generatedApiTypeNames.js';

/**
 * Structural stand-ins for the stock schemas. `generate:api` overwrites this
 * file. Aliases stay explicit so type-aware oxlint can check controllers
 * before that script runs. `any` would leak through the ignored
 * `src/generated` folder and fail `no-unsafe-assignment`.
 */
const INITIAL_API_TYPES_SOURCE: string = `export type StatusV1 = {
  status: string;
};
export type TodoV1 = {
  completed: boolean;
  createdAt: string;
  deletedAt: string | null;
  description: string;
  id: string;
  title: string;
  updatedAt: string;
};
export type CreateTodoV1RequestBody = {
  description: string;
  title: string;
};
export type PaginatedTodosV1Response = {
  items: TodoV1[];
  page: number;
  pageSize: number;
  totalItems: number;
};
export type UpdateTodoV1RequestBody = {
  completed?: boolean;
  description?: string;
  title?: string;
};
export type Root =
  | CreateTodoV1RequestBody
  | PaginatedTodosV1Response
  | StatusV1
  | TodoV1
  | UpdateTodoV1RequestBody;
`;

export function generateInitialApiTypesSource(): string {
  for (const typeName of GENERATED_API_TYPE_NAMES) {
    if (!INITIAL_API_TYPES_SOURCE.includes(`export type ${typeName} `)) {
      throw new Error(`Initial API types are missing an alias for ${typeName}`);
    }
  }

  return INITIAL_API_TYPES_SOURCE;
}
