import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodParameterMetadataByNameReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataByNameReflectKey.js';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey.js';
import { type ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata.js';
import { buildControllerMethodParameterMetadataFromRflct } from './buildControllerMethodParameterMetadataFromRflct.js';
import { getParameterNames } from './getParameterNames.js';

export function getControllerMethodParameterMetadataList(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): (ControllerMethodParameterMetadata | undefined)[] {
  const result: (ControllerMethodParameterMetadata | undefined)[] =
    findInPrototypeChain<(ControllerMethodParameterMetadata | undefined)[]>(
      controllerConstructor as Newable,
      (
        type: Newable,
      ): (ControllerMethodParameterMetadata | undefined)[] | undefined =>
        getOwnReflectMetadata(
          type,
          controllerMethodParameterMetadataReflectKey,
          methodKey,
        ) ??
        buildControllerMethodParameterMetadataFromRflct(type, methodKey),
    ) ?? [];

  // Merge name-based metadata from TC39 method decorators
  const byName: Record<string, ControllerMethodParameterMetadata> | undefined =
    findInPrototypeChain<Record<string, ControllerMethodParameterMetadata>>(
      controllerConstructor as Newable,
      (
        type: Newable,
      ): Record<string, ControllerMethodParameterMetadata> | undefined =>
        getOwnReflectMetadata(
          type,
          controllerMethodParameterMetadataByNameReflectKey,
          methodKey,
        ),
    );

  if (byName !== undefined) {
    const method: Function | undefined = (
      controllerConstructor.prototype as Record<string | symbol, unknown>
    )[methodKey] as Function | undefined;
    if (method !== undefined) {
      const paramNames: string[] = getParameterNames(method);
      for (const [name, metadata] of Object.entries(byName)) {
        const index: number = paramNames.indexOf(name);
        if (index !== -1) {
          result[index] = metadata;
        }
      }
    }
  }

  return result;
}
