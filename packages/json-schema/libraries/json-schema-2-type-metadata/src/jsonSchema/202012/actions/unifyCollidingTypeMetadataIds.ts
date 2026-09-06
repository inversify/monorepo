import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

export function duplicatedTypeMetadataIdError(id: string): Error {
  return new Error(`Duplicated TypeMetadata id "${id}"`);
}

/*
 * Moore partition refinement over the TypeMetadata graph. Named nodes that
 * share an id start together; untitled nodes start by kind and payload.
 * Blocks only split. After refinement, an id that occupies more than one
 * block is a real name collision of different types. A block that stayed
 * together is contracted. Untitled blocks are never contracted.
 */
export function unifyCollidingTypeMetadataIds(
  typeMetadata: TypeMetadata,
  titledTypeMetadata: Iterable<TypeMetadata> = [],
): TypeMetadata {
  const nodeToBlockId: Map<TypeMetadata, number> = new Map();
  const observationToBlockId: Map<string, number> = new Map();
  let nextBlockId: number = 0;

  function visit(node: TypeMetadata): void {
    if (nodeToBlockId.has(node)) {
      return;
    }

    const observation: string = buildInitialObservation(node);
    let blockId: number | undefined = observationToBlockId.get(observation);

    if (blockId === undefined) {
      blockId = nextBlockId;
      nextBlockId += 1;
      observationToBlockId.set(observation, blockId);
    }

    nodeToBlockId.set(node, blockId);
    visitTypeMetadataChildren(node, visit);
  }

  visit(typeMetadata);

  for (const titledNode of titledTypeMetadata) {
    visit(titledNode);
  }

  refineTypeMetadataPartition(nodeToBlockId, () => {
    const blockId: number = nextBlockId;
    nextBlockId += 1;
    return blockId;
  });

  assertUniqueIdBlocks(nodeToBlockId);

  const retargetMap: Map<TypeMetadata, TypeMetadata> =
    buildRetargetMap(nodeToBlockId);

  return retargetTypeMetadata(typeMetadata, retargetMap);
}

function assertUniqueIdBlocks(nodeToBlockId: Map<TypeMetadata, number>): void {
  const idToBlockIds: Map<string, Set<number>> = new Map();

  for (const [node, blockId] of nodeToBlockId) {
    if (node.id === undefined) {
      continue;
    }

    const blockIds: Set<number> = idToBlockIds.get(node.id) ?? new Set();

    blockIds.add(blockId);
    idToBlockIds.set(node.id, blockIds);
  }

  const collidingIds: string[] = [...idToBlockIds.entries()]
    .filter(([, blockIds]: [string, Set<number>]) => blockIds.size > 1)
    .map(([id]: [string, Set<number>]) => id)
    .sort();

  const collidingId: string | undefined = collidingIds[0];

  if (collidingId !== undefined) {
    throw duplicatedTypeMetadataIdError(collidingId);
  }
}

function buildInitialObservation(typeMetadata: TypeMetadata): string {
  return JSON.stringify([
    typeMetadata.id ?? null,
    typeMetadata.kind,
    typeMetadata.kind === TypeMetadataKind.literalType
      ? typeMetadata.literal
      : null,
    typeMetadata.kind === TypeMetadataKind.propertyType
      ? typeMetadata.property
      : null,
    typeMetadata.kind === TypeMetadataKind.propertyType
      ? typeMetadata.isOptional
      : null,
  ]);
}

function buildChildSignature(
  typeMetadata: TypeMetadata,
  nodeToBlockId: Map<TypeMetadata, number>,
): string {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
    case TypeMetadataKind.or:
      return typeMetadata.children
        .map((child: TypeMetadata) => requireBlockId(child, nodeToBlockId))
        .sort((left: number, right: number) => left - right)
        .join(',');
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      return requireBlockId(typeMetadata.child, nodeToBlockId).toString();
    default:
      return '';
  }
}

function buildRetargetMap(
  nodeToBlockId: Map<TypeMetadata, number>,
): Map<TypeMetadata, TypeMetadata> {
  const blockToTitledTypeMetadata: Map<number, TypeMetadata[]> = new Map();

  for (const [node, blockId] of nodeToBlockId) {
    if (node.id === undefined) {
      continue;
    }

    const titledTypeMetadata: TypeMetadata[] =
      blockToTitledTypeMetadata.get(blockId) ?? [];

    titledTypeMetadata.push(node);
    blockToTitledTypeMetadata.set(blockId, titledTypeMetadata);
  }

  const retargetMap: Map<TypeMetadata, TypeMetadata> = new Map();

  for (const titledTypeMetadata of blockToTitledTypeMetadata.values()) {
    const representative: TypeMetadata | undefined = titledTypeMetadata[0];

    if (representative === undefined || titledTypeMetadata.length === 1) {
      continue;
    }

    for (let i: number = 1; i < titledTypeMetadata.length; i += 1) {
      retargetMap.set(titledTypeMetadata[i] as TypeMetadata, representative);
    }
  }

  return retargetMap;
}

function refineTypeMetadataPartition(
  nodeToBlockId: Map<TypeMetadata, number>,
  allocateBlockId: () => number,
): void {
  let hasSplit: boolean = true;

  while (hasSplit) {
    hasSplit = false;

    const snapshotNodeToBlockId: Map<TypeMetadata, number> = new Map(
      nodeToBlockId,
    );
    const blockToNodes: Map<number, TypeMetadata[]> = new Map();

    for (const [node, blockId] of snapshotNodeToBlockId) {
      const blockNodes: TypeMetadata[] = blockToNodes.get(blockId) ?? [];

      blockNodes.push(node);
      blockToNodes.set(blockId, blockNodes);
    }

    for (const [blockId, blockNodes] of blockToNodes) {
      if (blockNodes.length === 1) {
        continue;
      }

      const signatureToNodes: Map<string, TypeMetadata[]> = new Map();

      for (const node of blockNodes) {
        const signature: string = buildChildSignature(
          node,
          snapshotNodeToBlockId,
        );
        const signatureNodes: TypeMetadata[] =
          signatureToNodes.get(signature) ?? [];

        signatureNodes.push(node);
        signatureToNodes.set(signature, signatureNodes);
      }

      if (signatureToNodes.size === 1) {
        continue;
      }

      hasSplit = true;

      let isFirstSignature: boolean = true;

      for (const signatureNodes of signatureToNodes.values()) {
        const nextBlockId: number = isFirstSignature
          ? blockId
          : allocateBlockId();

        isFirstSignature = false;

        for (const node of signatureNodes) {
          nodeToBlockId.set(node, nextBlockId);
        }
      }
    }
  }
}

function requireBlockId(
  typeMetadata: TypeMetadata,
  nodeToBlockId: Map<TypeMetadata, number>,
): number {
  const blockId: number | undefined = nodeToBlockId.get(typeMetadata);

  if (blockId === undefined) {
    throw new Error('TypeMetadata node is missing from the partition');
  }

  return blockId;
}

function retargetTypeMetadata(
  typeMetadata: TypeMetadata,
  retargetMap: Map<TypeMetadata, TypeMetadata>,
): TypeMetadata {
  const rootTypeMetadata: TypeMetadata =
    retargetMap.get(typeMetadata) ?? typeMetadata;

  if (retargetMap.size === 0) {
    return rootTypeMetadata;
  }

  const seenTypeMetadataSet: Set<TypeMetadata> = new Set();

  function visit(node: TypeMetadata): void {
    if (seenTypeMetadataSet.has(node)) {
      return;
    }

    seenTypeMetadataSet.add(node);

    switch (node.kind) {
      case TypeMetadataKind.and:
      case TypeMetadataKind.or:
        for (let i: number = 0; i < node.children.length; i += 1) {
          const child: TypeMetadata = node.children[i] as TypeMetadata;
          const retargetedChild: TypeMetadata = retargetMap.get(child) ?? child;

          node.children[i] = retargetedChild;
          visit(retargetedChild);
        }
        break;
      case TypeMetadataKind.arrayType:
      case TypeMetadataKind.propertyType:
      case TypeMetadataKind.stringIndexSignatureType: {
        const retargetedChild: TypeMetadata =
          retargetMap.get(node.child) ?? node.child;

        node.child = retargetedChild;
        visit(retargetedChild);
        break;
      }
      default:
        break;
    }
  }

  visit(rootTypeMetadata);

  return rootTypeMetadata;
}

function visitTypeMetadataChildren(
  typeMetadata: TypeMetadata,
  visit: (child: TypeMetadata) => void,
): void {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
    case TypeMetadataKind.or:
      for (const child of typeMetadata.children) {
        visit(child);
      }
      break;
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      visit(typeMetadata.child);
      break;
    default:
      break;
  }
}
