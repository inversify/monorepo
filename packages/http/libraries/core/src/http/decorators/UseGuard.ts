import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';
import { controllerMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodGuardMetadataReflectKey';
import { ControllerFunction } from '../models/ControllerFunction';

export function useGuard(
  ...guardList: NewableFunction[]
): ClassDecorator & MethodDecorator {
  return (
    target: object,
    _key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    let guardMetadataList: NewableFunction[] | undefined = undefined;

    if (descriptor === undefined) {
      guardMetadataList = getReflectMetadata(
        target,
        controllerGuardMetadataReflectKey,
      );
    } else {
      guardMetadataList = getReflectMetadata(
        descriptor.value as ControllerFunction,
        controllerMethodGuardMetadataReflectKey,
      );
    }

    if (guardMetadataList !== undefined) {
      guardMetadataList.push(...guardList);
    } else {
      guardMetadataList = guardList;
    }

    if (descriptor === undefined) {
      setReflectMetadata(
        target,
        controllerGuardMetadataReflectKey,
        guardMetadataList,
      );
    } else {
      setReflectMetadata(
        descriptor.value as ControllerFunction,
        controllerMethodGuardMetadataReflectKey,
        guardMetadataList,
      );
    }
  };
}
