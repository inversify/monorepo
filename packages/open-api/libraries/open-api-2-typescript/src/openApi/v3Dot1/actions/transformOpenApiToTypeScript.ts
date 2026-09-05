import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type TraverseJsonSchemaCallbackParams } from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { traverseOpenApiObjectJsonSchemas } from '@inversifyjs/open-api-utils/v3Dot1';

import { transformOpenApiObjectToTypeScript } from '../../actions/transformOpenApiObjectToTypeScript.js';
import { OPEN_API_3_DOT_1_DOCUMENT_URI } from '../../models/openApiDocumentUri.js';
import { type TransformOpenApiToTypeScriptOptions } from '../../models/TransformOpenApiToTypeScriptOptions.js';

export function transformOpenApiToTypeScript(
  openApiObject: OpenApi3Dot1Object,
  options?: TransformOpenApiToTypeScriptOptions,
): string {
  return transformOpenApiObjectToTypeScript(
    openApiObject as unknown as JsonValue,
    {
      fallbackDocumentUri: OPEN_API_3_DOT_1_DOCUMENT_URI,
      options,
      traverse: (
        document: JsonValue,
        callback: (params: TraverseJsonSchemaCallbackParams) => void,
      ): void => {
        traverseOpenApiObjectJsonSchemas(
          document as unknown as OpenApi3Dot1Object,
          callback,
        );
      },
    },
  );
}
