import { type ServiceIdentifier } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { type MetadataName } from '../models/MetadataName.js';
import { type MetadataTag } from '../models/MetadataTag.js';
import { getDefaultClassMetadata } from './getDefaultClassMetadata.js';

const DESIGN_PARAMTYPES: string = 'design:paramtypes';
const DESIGN_PROPERTYTYPE: string = 'design:propertytype';
const DESIGN_PROPERTIES: string = 'design:properties';
const DESIGN_CLASS: string = 'design:class';

interface RflctParamEntry {
  type: ServiceIdentifier;
  metadata: Record<string, unknown>;
  elementType?: ServiceIdentifier;
}

function buildClassElementMetadataFromRflctEntry(
  entry: RflctParamEntry,
): ClassElementMetadata {
  const meta: Record<string, unknown> = entry.metadata;

  if (meta['unmanaged'] === true) {
    return { kind: ClassElementMetadataKind.unmanaged };
  }

  const isMulti: boolean = meta['multi'] === true;
  const serviceIdentifier: ServiceIdentifier =
    isMulti && entry.elementType !== undefined
      ? entry.elementType
      : entry.type;

  const tags: Map<MetadataTag, unknown> = new Map();

  if (meta['tags'] !== undefined && typeof meta['tags'] === 'object' && meta['tags'] !== null) {
    for (const [key, value] of Object.entries(meta['tags'] as Record<string, unknown>)) {
      tags.set(key, value);
    }
  }

  if (isMulti) {
    return {
      chained: meta['chained'] === true,
      kind: ClassElementMetadataKind.multipleInjection,
      name: (meta['name'] as MetadataName | undefined) ?? undefined,
      optional: meta['optional'] === true,
      tags,
      value: serviceIdentifier,
    };
  }

  return {
    kind: ClassElementMetadataKind.singleInjection,
    name: (meta['name'] as MetadataName | undefined) ?? undefined,
    optional: meta['optional'] === true,
    tags,
    value: serviceIdentifier,
  };
}

export function buildClassMetadataFromRflct(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): ClassMetadata | undefined {
  const paramTypes: RflctParamEntry[] | undefined = getOwnReflectMetadata(
    type,
    DESIGN_PARAMTYPES,
  );

  const prototype: object | undefined = type.prototype as object | undefined;
  const propertyKeys: (string | symbol)[] =
    prototype !== undefined
      ? (getOwnReflectMetadata<(string | symbol)[]>(type, DESIGN_PROPERTIES) ?? [])
      : [];

  const classLevelMeta: Record<string, unknown> | undefined =
    getOwnReflectMetadata(type, DESIGN_CLASS);

  if (paramTypes === undefined && propertyKeys.length === 0 && classLevelMeta === undefined) {
    return undefined;
  }

  const classMetadata: ClassMetadata = getDefaultClassMetadata();

  if (paramTypes !== undefined) {
    classMetadata.constructorArguments = paramTypes.map(
      (entry: RflctParamEntry | undefined) =>
        entry !== undefined
          ? buildClassElementMetadataFromRflctEntry(entry)
          : (undefined as unknown as ClassElementMetadata),
    );
  }

  for (const propertyKey of propertyKeys) {
    const propMeta: RflctParamEntry[] | undefined =
      getOwnReflectMetadata(prototype!, DESIGN_PROPERTYTYPE, propertyKey) ??
      getOwnReflectMetadata(prototype!, DESIGN_PARAMTYPES, propertyKey);
    if (propMeta !== undefined && propMeta.length > 0) {
      const entry: RflctParamEntry = propMeta[0]!;
      const meta: Record<string, unknown> = entry.metadata;

      if (meta['postConstruct'] === true) {
        classMetadata.lifecycle.postConstructMethodNames.add(propertyKey as string);
      } else if (meta['preDestroy'] === true) {
        classMetadata.lifecycle.preDestroyMethodNames.add(propertyKey as string);
      } else {
        classMetadata.properties.set(
          propertyKey,
          buildClassElementMetadataFromRflctEntry(entry),
        );
      }
    }
  }

  if (classLevelMeta !== undefined) {
    if (classLevelMeta['scope'] !== undefined) {
      classMetadata.scope = classLevelMeta['scope'] as BindingScope;
    }
  }

  // Walk prototype chain for inherited metadata (replaces @injectFromBase / @injectFromHierarchy)
  let parent: Function | null = Object.getPrototypeOf(type) as Function | null;
  while (parent !== null && parent !== Function.prototype && parent !== Object) {
    const parentMeta: ClassMetadata | undefined = buildClassMetadataFromRflct(parent);
    if (parentMeta !== undefined) {
      for (let i: number = 0; i < parentMeta.constructorArguments.length; i++) {
        if (classMetadata.constructorArguments[i] === undefined) {
          classMetadata.constructorArguments[i] = parentMeta.constructorArguments[i]!;
        }
      }
      for (const [key, value] of parentMeta.properties) {
        if (!classMetadata.properties.has(key)) {
          classMetadata.properties.set(key, value);
        }
      }
      for (const name of parentMeta.lifecycle.postConstructMethodNames) {
        classMetadata.lifecycle.postConstructMethodNames.add(name);
      }
      for (const name of parentMeta.lifecycle.preDestroyMethodNames) {
        classMetadata.lifecycle.preDestroyMethodNames.add(name);
      }
    }
    parent = Object.getPrototypeOf(parent) as Function | null;
  }

  return classMetadata;
}
