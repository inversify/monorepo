import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { toSchema } from './toSchema';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

export function toSchemaInSchemaMetadataContext(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): ToSchemaFunction {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return toSchema((type: Function): void => {
    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataReferences(type),
    );
  });
}
