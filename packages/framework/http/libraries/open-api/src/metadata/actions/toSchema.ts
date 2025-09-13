import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { JsonSchema } from '@inversifyjs/json-schema-types/2020-12';
import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { tryBuildSchemaFromWellKnownType } from '../calculations/tryBuildSchemaFromWellKnownType';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';

export function toSchema(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  updateMetadataReferences: (type: Function) => void,
): ToSchemaFunction {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    type: Function,
  ): OpenApi3Dot1SchemaObject => {
    const name: string =
      getOwnReflectMetadata<SchemaMetadata>(
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
