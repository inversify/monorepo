import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchemaInSchemaMetadataContext } from '../actions/toSchemaInSchemaMetadataContext';
import { updateSchemaMetadataName } from '../actions/updateSchemaMetadataName';
import { updateSchemaMetadataSchema } from '../actions/updateSchemaMetadataSchema';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { SchemaDecoratorOptions } from '../models/SchemaDecoratorOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Schema(
  schema?:
    | OpenApi3Dot1SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
  options?: SchemaDecoratorOptions,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function): void => {
    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataName(options, target),
    );

    const schemaResult: OpenApi3Dot1SchemaObject | undefined =
      typeof schema === 'function'
        ? schema(toSchemaInSchemaMetadataContext(target))
        : schema;

    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataSchema(schemaResult, target),
    );
  };
}
