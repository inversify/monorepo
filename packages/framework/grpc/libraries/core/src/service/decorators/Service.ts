import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable, type ServiceIdentifier } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { serviceMetadataReflectKey } from '../../reflectMetadata/data/serviceMetadataReflectKey.js';
import { type GrpcServiceDefinition } from '../models/GrpcServiceDefinition.js';
import { type ServiceMetadata } from '../models/ServiceMetadata.js';
import { type ServiceOptions } from '../models/ServiceOptions.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Service(
  definition: GrpcServiceDefinition,
  options?: ServiceOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    // Generated code imported under the wrong name is undefined at runtime.
    const definitionValue: unknown = definition;

    if (
      typeof definitionValue !== 'object' ||
      definitionValue === null ||
      Array.isArray(definitionValue)
    ) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidServiceDefinition,
        '@Service() requires a service definition',
      );
    }

    const serviceMetadata: ServiceMetadata = {
      definition,
      serviceIdentifier:
        options?.serviceIdentifier ?? (target as ServiceIdentifier),
      target,
    };

    injectable(options?.scope)(target);

    updateOwnReflectMetadata(
      Reflect,
      serviceMetadataReflectKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithElement(serviceMetadata),
    );
  };
}
