import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { type InjectFromOptions } from '../models/InjectFromOptions.js';

export function getExtendedConstructorArguments(
  options: InjectFromOptions,
  baseTypeClassMetadata: ClassMetadata,
  typeMetadata: ClassMetadata,
): ClassElementMetadata[] {
  const extendConstructorArguments: boolean =
    options.extendConstructorArguments ?? true;

  let extendedConstructorArguments: ClassElementMetadata[];

  if (extendConstructorArguments) {
    extendedConstructorArguments = [
      ...baseTypeClassMetadata.constructorArguments,
    ];

    typeMetadata.constructorArguments.map(
      (classElementMetadata: ClassElementMetadata, index: number) => {
        extendedConstructorArguments[index] = classElementMetadata;
      },
    );
  } else {
    extendedConstructorArguments = typeMetadata.constructorArguments;
  }

  return extendedConstructorArguments;
}
