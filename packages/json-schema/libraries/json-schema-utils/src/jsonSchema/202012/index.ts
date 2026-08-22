export {
  type DynamicScopeEntry,
  type LexicalScope,
  type ResolutionContext,
  type ResolutionFailure,
  type SchemaResolutionSuccessLinks,
  type SchemaResolutionSuccessNode,
  type SchemaResolutionSuccessTree,
  JsonSchemaResolver,
} from './services/JsonSchemaResolver.js';
export { type TraverseJsonSchemaCallbackParams } from './models/TraverseJsonSchemaCallbackParams.js';
export { type TraverseJsonSchemaParams } from './models/TraverseJsonSchemaParams.js';

export { traverse } from './actions/traverse.js';
