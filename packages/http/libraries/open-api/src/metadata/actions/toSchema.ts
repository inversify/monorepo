import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';
import { SchemaMetadata } from '../models/SchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';

export function toSchema(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  options: SchemaDecoratorOptions | undefined,
): ToSchemaFunction {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    type: Function,
  ): OpenApi3Dot1SchemaObject => {
    const name: string = options?.name ?? type.name;

    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      (metadata: SchemaMetadata): SchemaMetadata => {
        metadata.references.set(name, type);

        return metadata;
      },
    );

    return {
      // TODO: Escape name in a way it's a valid JSON Pointer
      $ref: `#/components/schemas/${name}`,
    };
  };
}
