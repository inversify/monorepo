import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/schemaOpenApiMetadataReflectKey.js';
import { toSchemaInSchemaMetadataContext } from '../../actions/v3Dot1/toSchemaInSchemaMetadataContext.js';
import { updateSchemaMetadataProperty } from '../../actions/v3Dot1/updateSchemaMetadataProperty.js';
import { buildDefaultSchemaMetadata } from '../../calculations/v3Dot1/buildDefaultSchemaMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot1/BuildOpenApiBlockFunction.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function BaseOasSchemaProperty(
  required: boolean,
): (
  schema?:
    | OpenApi3Dot1SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
) => PropertyDecorator {
  return (
    schema?:
      | OpenApi3Dot1SchemaObject
      | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
  ): PropertyDecorator => {
    return (target: object, propertyKey: string | symbol): void => {
      if (typeof propertyKey === 'symbol') {
        throw new Error(
          `Cannot apply SchemaProperty decorator to "${target.constructor.name}.${propertyKey.toString()}" symbol property`,
        );
      }

      const schemaResult: OpenApi3Dot1SchemaObject | undefined =
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
