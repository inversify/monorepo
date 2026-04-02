import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/schemaOpenApiMetadataReflectKey.js';
import { toSchemaInSchemaMetadataContext } from '../../actions/v3Dot2/toSchemaInSchemaMetadataContext.js';
import { updateSchemaMetadataProperty } from '../../actions/v3Dot2/updateSchemaMetadataProperty.js';
import { buildDefaultSchemaMetadata } from '../../calculations/v3Dot2/buildDefaultSchemaMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot2/OpenApiSchemaMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function BaseOasSchemaProperty(
  required: boolean,
): (
  schema?:
    | OpenApi3Dot2SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot2SchemaObject>,
) => PropertyDecorator {
  return (
    schema?:
      | OpenApi3Dot2SchemaObject
      | BuildOpenApiBlockFunction<OpenApi3Dot2SchemaObject>,
  ): PropertyDecorator => {
    return (target: object, propertyKey: string | symbol): void => {
      if (typeof propertyKey === 'symbol') {
        throw new Error(
          `Cannot apply SchemaProperty decorator to "${target.constructor.name}.${propertyKey.toString()}" symbol property`,
        );
      }

      const schemaResult: OpenApi3Dot2SchemaObject | undefined =
        typeof schema === 'function'
          ? schema(toSchemaInSchemaMetadataContext(target.constructor))
          : schema;

      updateOwnReflectMetadata<OpenApiSchemaMetadata>(
        target.constructor,
        schemaOpenApiMetadataReflectKey,
        buildDefaultSchemaMetadata,
        updateSchemaMetadataProperty(propertyKey, required, schemaResult),
      );
    };
  };
}
