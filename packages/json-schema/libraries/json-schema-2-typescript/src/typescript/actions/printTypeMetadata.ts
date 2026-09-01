import {
  type AndTypeMetadata,
  type PropertyTypeMetadata,
  type StringIndexSignatureTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { type PrintTypeMetadataContext } from '../models/PrintTypeMetadataContext.js';
import { isTypeMetadataAssignableTo } from './isTypeMetadataAssignableTo.js';
import {
  printJsonValueLiteral,
  printPropertyKey,
} from './printJsonValueLiteral.js';
import { visitTypeMetadataChildren } from './visitTypeMetadataChildren.js';

export function printTypeMetadata(
  typeMetadata: TypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const name: string | undefined =
    context.typeMetadataToNameMap.get(typeMetadata);

  if (name !== undefined) {
    return name;
  }

  return printTypeMetadataExpanded(typeMetadata, context);
}

export function printTypeMetadataExpanded(
  typeMetadata: TypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
      return printAndTypeMetadata(typeMetadata, context);
    case TypeMetadataKind.anyType:
      return 'unknown';
    case TypeMetadataKind.arrayType:
      return `${parenthesizeArrayElement(typeMetadata.child, context)}[]`;
    case TypeMetadataKind.booleanType:
      return 'boolean';
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
      return 'number';
    case TypeMetadataKind.literalType:
      return printJsonValueLiteral(typeMetadata.literal);
    case TypeMetadataKind.noneType:
      return 'never';
    case TypeMetadataKind.objectType:
      return 'object';
    case TypeMetadataKind.or:
      return typeMetadata.children
        .map((child: TypeMetadata) => parenthesizeUnionMember(child, context))
        .join(' | ');
    case TypeMetadataKind.propertyType:
      return `{ ${printPropertyMember(typeMetadata, context)} }`;
    case TypeMetadataKind.stringIndexSignatureType:
      return `{ [key: string]: ${printTypeMetadata(typeMetadata.child, context)} }`;
    case TypeMetadataKind.stringType:
      return 'string';
  }
}

function parenthesizeArrayElement(
  typeMetadata: TypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const printed: string = printTypeMetadata(typeMetadata, context);

  if (context.typeMetadataToNameMap.has(typeMetadata)) {
    return printed;
  }

  if (typeMetadata.kind === TypeMetadataKind.or) {
    return `(${printed})`;
  }

  if (typeMetadata.kind === TypeMetadataKind.and && printed.includes(' & ')) {
    return `(${printed})`;
  }

  return printed;
}

function parenthesizeIntersectionMember(
  typeMetadata: TypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const printed: string = printTypeMetadata(typeMetadata, context);

  if (context.typeMetadataToNameMap.has(typeMetadata)) {
    return printed;
  }

  if (typeMetadata.kind === TypeMetadataKind.or) {
    return `(${printed})`;
  }

  return printed;
}

function parenthesizeUnionMember(
  typeMetadata: TypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const printed: string = printTypeMetadata(typeMetadata, context);

  if (context.typeMetadataToNameMap.has(typeMetadata)) {
    return printed;
  }

  if (typeMetadata.kind === TypeMetadataKind.and && printed.includes(' & ')) {
    return `(${printed})`;
  }

  return printed;
}

function printAndTypeMetadata(
  typeMetadata: AndTypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const objectMembers: string[] = [];
  const otherPrintedTypeMetadata: string[] = [];
  const propertyTypeMetadata: PropertyTypeMetadata[] = [];
  const stringIndexSignatureMemberIndexes: number[] = [];
  const stringIndexSignatureTypeMetadata: StringIndexSignatureTypeMetadata[] =
    [];
  let hasNeverStringIndexSignature: boolean = false;
  let hasObjectType: boolean = false;

  for (const child of typeMetadata.children) {
    if (
      context.typeMetadataToNameMap.has(child) &&
      child.kind === TypeMetadataKind.and &&
      doesTypeMetadataReach(child, typeMetadata)
    ) {
      collectObjectMembersFromAnd(
        child,
        typeMetadata,
        new Set(),
        objectMembers,
        propertyTypeMetadata,
        stringIndexSignatureMemberIndexes,
        stringIndexSignatureTypeMetadata,
        context,
      );
    } else if (context.typeMetadataToNameMap.has(child)) {
      otherPrintedTypeMetadata.push(
        parenthesizeIntersectionMember(child, context),
      );
    } else if (child.kind === TypeMetadataKind.propertyType) {
      propertyTypeMetadata.push(child);
      objectMembers.push(printPropertyMember(child, context));
    } else if (child.kind === TypeMetadataKind.stringIndexSignatureType) {
      if (child.child.kind === TypeMetadataKind.noneType) {
        // additionalProperties: false. Omit it when properties exist so the
        // object type stays valid TypeScript (`foo: string` is not `never`).
        hasNeverStringIndexSignature = true;
      } else {
        queueStringIndexSignatureMember(
          child,
          objectMembers,
          stringIndexSignatureMemberIndexes,
          stringIndexSignatureTypeMetadata,
        );
      }
    } else if (child.kind === TypeMetadataKind.objectType) {
      hasObjectType = true;
    } else {
      otherPrintedTypeMetadata.push(
        parenthesizeIntersectionMember(child, context),
      );
    }
  }

  assertPropertyTypesAssignableToStringIndexSignatures(
    propertyTypeMetadata,
    stringIndexSignatureTypeMetadata,
    context,
  );

  fillStringIndexSignatureMembers(
    objectMembers,
    propertyTypeMetadata,
    stringIndexSignatureMemberIndexes,
    stringIndexSignatureTypeMetadata,
    context,
  );

  const printedTypeMetadata: string[] = [];

  if (objectMembers.length > 0) {
    printedTypeMetadata.push(`{ ${objectMembers.join('; ')} }`);
  } else if (hasNeverStringIndexSignature) {
    printedTypeMetadata.push('{ [key: string]: never }');
  } else if (hasObjectType) {
    printedTypeMetadata.push('object');
  }

  printedTypeMetadata.push(...otherPrintedTypeMetadata);

  if (printedTypeMetadata.length === 0) {
    return 'unknown';
  }

  if (printedTypeMetadata.length === 1) {
    return printedTypeMetadata[0] as string;
  }

  return printedTypeMetadata.join(' & ');
}

function assertPropertyTypesAssignableToStringIndexSignatures(
  propertyTypeMetadata: PropertyTypeMetadata[],
  stringIndexSignatureTypeMetadata: StringIndexSignatureTypeMetadata[],
  context: PrintTypeMetadataContext,
): void {
  for (const indexTypeMetadata of stringIndexSignatureTypeMetadata) {
    for (const property of propertyTypeMetadata) {
      if (
        !isTypeMetadataAssignableTo(property.child, indexTypeMetadata.child)
      ) {
        throw new Error(
          `Property '${property.property}' of type '${printTypeMetadata(property.child, context)}' is not assignable to 'string' index type '${printTypeMetadata(indexTypeMetadata.child, context)}'.`,
        );
      }
    }
  }
}

function collectObjectMembersFromAnd(
  typeMetadata: AndTypeMetadata,
  stopTypeMetadata: TypeMetadata,
  visitedTypeMetadata: Set<TypeMetadata>,
  objectMembers: string[],
  propertyTypeMetadata: PropertyTypeMetadata[],
  stringIndexSignatureMemberIndexes: number[],
  stringIndexSignatureTypeMetadata: StringIndexSignatureTypeMetadata[],
  context: PrintTypeMetadataContext,
): void {
  if (visitedTypeMetadata.has(typeMetadata)) {
    return;
  }

  visitedTypeMetadata.add(typeMetadata);

  for (const child of typeMetadata.children) {
    if (child !== stopTypeMetadata) {
      if (child.kind === TypeMetadataKind.propertyType) {
        propertyTypeMetadata.push(child);
        objectMembers.push(printPropertyMember(child, context));
      } else if (child.kind === TypeMetadataKind.stringIndexSignatureType) {
        if (child.child.kind !== TypeMetadataKind.noneType) {
          queueStringIndexSignatureMember(
            child,
            objectMembers,
            stringIndexSignatureMemberIndexes,
            stringIndexSignatureTypeMetadata,
          );
        }
      } else if (child.kind === TypeMetadataKind.and) {
        collectObjectMembersFromAnd(
          child,
          stopTypeMetadata,
          visitedTypeMetadata,
          objectMembers,
          propertyTypeMetadata,
          stringIndexSignatureMemberIndexes,
          stringIndexSignatureTypeMetadata,
          context,
        );
      }
    }
  }
}

function fillStringIndexSignatureMembers(
  objectMembers: string[],
  propertyTypeMetadata: PropertyTypeMetadata[],
  stringIndexSignatureMemberIndexes: number[],
  stringIndexSignatureTypeMetadata: StringIndexSignatureTypeMetadata[],
  context: PrintTypeMetadataContext,
): void {
  const hasOptionalProperty: boolean = propertyTypeMetadata.some(
    (property: PropertyTypeMetadata) => property.isOptional,
  );

  for (const [
    index,
    indexTypeMetadata,
  ] of stringIndexSignatureTypeMetadata.entries()) {
    objectMembers[stringIndexSignatureMemberIndexes[index] as number] =
      printStringIndexSignatureMember(
        indexTypeMetadata,
        hasOptionalProperty,
        context,
      );
  }
}

function queueStringIndexSignatureMember(
  typeMetadata: StringIndexSignatureTypeMetadata,
  objectMembers: string[],
  stringIndexSignatureMemberIndexes: number[],
  stringIndexSignatureTypeMetadata: StringIndexSignatureTypeMetadata[],
): void {
  stringIndexSignatureTypeMetadata.push(typeMetadata);
  stringIndexSignatureMemberIndexes.push(objectMembers.length);
  objectMembers.push('');
}

function printStringIndexSignatureMember(
  typeMetadata: StringIndexSignatureTypeMetadata,
  hasOptionalProperty: boolean,
  context: PrintTypeMetadataContext,
): string {
  const printedChild: string = printTypeMetadata(typeMetadata.child, context);

  if (hasOptionalProperty) {
    return `[key: string]: ${printedChild} | undefined`;
  }

  return `[key: string]: ${printedChild}`;
}

function doesTypeMetadataReach(
  typeMetadata: TypeMetadata,
  targetTypeMetadata: TypeMetadata,
): boolean {
  const visitedTypeMetadata: Set<TypeMetadata> = new Set();

  function visit(node: TypeMetadata): boolean {
    if (node === targetTypeMetadata) {
      return true;
    }

    if (visitedTypeMetadata.has(node)) {
      return false;
    }

    visitedTypeMetadata.add(node);

    let reachesTargetTypeMetadata: boolean = false;

    visitTypeMetadataChildren(node, (child: TypeMetadata) => {
      if (!reachesTargetTypeMetadata) {
        reachesTargetTypeMetadata = visit(child);
      }
    });

    return reachesTargetTypeMetadata;
  }

  return visit(typeMetadata);
}

function printPropertyMember(
  typeMetadata: PropertyTypeMetadata,
  context: PrintTypeMetadataContext,
): string {
  const optionalMark: string = typeMetadata.isOptional ? '?' : '';

  return `${printPropertyKey(typeMetadata.property)}${optionalMark}: ${printTypeMetadata(typeMetadata.child, context)}`;
}
