import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import {
  getOwnReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

export function toSchema(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
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

    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataReferences(name, type),
    );

    return {
      // TODO: Escape name in a way it's a valid JSON Pointer
      $ref: `#/components/schemas/${name}`,
    };
  };
}
