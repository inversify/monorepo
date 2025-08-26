import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { toSchema } from '../actions/toSchema';
import { updateSchemaMetadataProperty } from '../actions/updateSchemaMetadataProperty';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';
import { SchemaMetadata } from '../models/SchemaMetadata';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function SchemaProperty(
  schema?:
    | OpenApi3Dot1SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot1SchemaObject>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(
        `Cannot apply SchemaProperty decorator to "${target.constructor.name}.${propertyKey.toString()}" symbol property`,
      );
    }

    const schemaResult: OpenApi3Dot1SchemaObject | undefined =
      typeof schema === 'function'
        ? schema(toSchema(target.constructor))
        : schema;

    updateOwnReflectMetadata<SchemaMetadata>(
      target.constructor,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataProperty(propertyKey, schemaResult),
    );
  };
}
