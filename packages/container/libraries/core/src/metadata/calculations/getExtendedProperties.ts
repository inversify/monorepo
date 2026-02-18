import { chain } from '../../common/calculations/chain.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { type InjectFromOptions } from '../models/InjectFromOptions.js';

export function getExtendedProperties(
  options: InjectFromOptions,
  baseTypeClassMetadata: ClassMetadata,
  typeMetadata: ClassMetadata,
): Map<string | symbol, ClassElementMetadata> {
  const extendProperties: boolean = options.extendProperties ?? true;

  let extendedProperties: Map<string | symbol, ClassElementMetadata>;

  if (extendProperties) {
    extendedProperties = new Map(
      chain(baseTypeClassMetadata.properties, typeMetadata.properties),
    );
  } else {
    extendedProperties = typeMetadata.properties;
  }

  return extendedProperties;
}
