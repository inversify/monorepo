import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';
import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/schemaOpenApiMetadataReflectKey.js';
import { tryBuildSchemaFromWellKnownType } from '../../calculations/tryBuildSchemaFromWellKnownType.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';
import { type ToSchemaFunction } from '../../models/v3Dot1/ToSchemaFunction.js';

export function toSchema(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  updateMetadataReferences: (type: Function) => void,
): ToSchemaFunction {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    type: Function,
  ): OpenApi3Dot1SchemaObject => {
    const name: string =
      getOwnReflectMetadata<OpenApiSchemaMetadata>(
        type,
        schemaOpenApiMetadataReflectKey,
      )?.name ?? type.name;

    const schemaFromWellKnownType: JsonSchema | undefined =
      tryBuildSchemaFromWellKnownType(type);

    if (schemaFromWellKnownType === undefined) {
      updateMetadataReferences(type);

      return {
        $ref: `#/components/schemas/${escapeJsonPointerFragments(name)}`,
      };
    }

    return schemaFromWellKnownType;
  };
}
