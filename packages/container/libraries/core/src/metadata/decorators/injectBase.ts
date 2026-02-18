import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { updateMaybeClassMetadataConstructorArgument } from '../actions/updateMaybeClassMetadataConstructorArgument.js';
import { updateMaybeClassMetadataProperty } from '../actions/updateMaybeClassMetadataProperty.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { handleInjectionError } from '../calculations/handleInjectionError.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';

export function injectBase(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): MethodDecorator & ParameterDecorator & PropertyDecorator;
export function injectBase(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): <T>(
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndex?: number | TypedPropertyDescriptor<T>,
) => void;
export function injectBase(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): MethodDecorator & ParameterDecorator & PropertyDecorator {
  const decorator: MethodDecorator & ParameterDecorator & PropertyDecorator = <
    T,
  >(
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndexOrDescriptor?: number | TypedPropertyDescriptor<T>,
  ): void => {
    try {
      if (parameterIndexOrDescriptor === undefined) {
        injectProperty(updateMetadata, updatePendingClassMetadataCount)(
          target,
          propertyKey as string | symbol,
        );
      } else {
        if (typeof parameterIndexOrDescriptor === 'number') {
          injectParameter(updateMetadata, updatePendingClassMetadataCount)(
            target,
            propertyKey,
            parameterIndexOrDescriptor,
          );
        } else {
          injectMethod(updateMetadata, updatePendingClassMetadataCount)(
            target,
            propertyKey as string | symbol,
            parameterIndexOrDescriptor,
          );
        }
      }
    } catch (error: unknown) {
      handleInjectionError(
        target,
        propertyKey,
        parameterIndexOrDescriptor,
        error,
      );
    }
  };

  return decorator;
}

function buildComposedUpdateMetadata(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): (
  target: object,
) => (
  metadata: MaybeClassElementMetadata | undefined,
) => MaybeClassElementMetadata {
  return (
    target: object,
  ): ((
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata) => {
    const updateTargetPendingClassMetadataCount: (
      metadata: MaybeClassElementMetadata | undefined,
    ) => void = updatePendingClassMetadataCount(target);

    return (
      metadata: MaybeClassElementMetadata | undefined,
    ): MaybeClassElementMetadata => {
      updateTargetPendingClassMetadataCount(metadata);

      return updateMetadata(metadata);
    };
  };
}

function injectMethod(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): MethodDecorator {
  const buildComposedUpdateMetadataFromTarget: (
    target: object,
  ) => (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata = buildComposedUpdateMetadata(
    updateMetadata,
    updatePendingClassMetadataCount,
  );

  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): void => {
    if (isPropertySetter(descriptor)) {
      updateOwnReflectMetadata(
        target.constructor,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataProperty(
          buildComposedUpdateMetadataFromTarget(target),
          propertyKey,
        ),
      );
    } else {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        `Found an @inject decorator in a non setter property method.
Found @inject decorator at method "${propertyKey.toString()}" at class "${target.constructor.name}"`,
      );
    }
  };
}

function injectParameter(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): ParameterDecorator {
  const buildComposedUpdateMetadataFromTarget: (
    target: object,
  ) => (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata = buildComposedUpdateMetadata(
    updateMetadata,
    updatePendingClassMetadataCount,
  );

  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void => {
    if (isConstructorParameter(target, propertyKey)) {
      updateOwnReflectMetadata(
        target,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataConstructorArgument(
          buildComposedUpdateMetadataFromTarget(target),
          parameterIndex,
        ),
      );
    } else {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        `Found an @inject decorator in a non constructor parameter.
Found @inject decorator at method "${
          propertyKey?.toString() ?? ''
        }" at class "${target.constructor.name}"`,
      );
    }
  };
}

function injectProperty(
  updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  updatePendingClassMetadataCount: (
    target: object,
  ) => (metadata: MaybeClassElementMetadata | undefined) => void,
): PropertyDecorator {
  const buildComposedUpdateMetadataFromTarget: (
    target: object,
  ) => (
    metadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata = buildComposedUpdateMetadata(
    updateMetadata,
    updatePendingClassMetadataCount,
  );

  return (target: object, propertyKey: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      classMetadataReflectKey,
      getDefaultClassMetadata,
      updateMaybeClassMetadataProperty(
        buildComposedUpdateMetadataFromTarget(target),
        propertyKey,
      ),
    );
  };
}

function isConstructorParameter(
  target: unknown,
  propertyKey: string | symbol | undefined,
): boolean {
  return typeof target === 'function' && propertyKey === undefined;
}

function isPropertySetter<T>(descriptor: TypedPropertyDescriptor<T>): boolean {
  return descriptor.set !== undefined;
}
