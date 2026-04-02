import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/schemaOpenApiMetadataReflectKey.js';
import { toSchemaInSchemaMetadataContext } from '../../actions/v3Dot2/toSchemaInSchemaMetadataContext.js';
import { updateSchemaMetadataFromOptions } from '../../actions/v3Dot2/updateSchemaMetadataFromOptions.js';
import { updateSchemaMetadataSchema } from '../../actions/v3Dot2/updateSchemaMetadataSchema.js';
import { buildDefaultSchemaMetadata } from '../../calculations/v3Dot2/buildDefaultSchemaMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';
import { type OasSchemaDecoratorOptions } from '../../models/v3Dot2/OasSchemaDecoratorOptions.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSchema(
  schema?:
    | OpenApi3Dot2SchemaObject
    | BuildOpenApiBlockFunction<OpenApi3Dot2SchemaObject>,
  options?: OasSchemaDecoratorOptions,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function): void => {
    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataFromOptions(options, target),
    );

    const schemaResult: OpenApi3Dot2SchemaObject | undefined =
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
