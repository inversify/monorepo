import type ts from 'typescript';

import { RelevantCommentKind, type RelevantCommentPositions } from './types.js';
import visitRelevantCommentPositions from './visitRelevantCommentPositions.js';

export default function findRelevantCommentPositions(
  fileContent: string,
  sourceFileNode: ts.SourceFile,
): RelevantCommentPositions {
  const positions: RelevantCommentPositions = {
    kindToPositionsMap: {
      [RelevantCommentKind.begin]: [],
      [RelevantCommentKind.end]: [],
      [RelevantCommentKind.exclude]: [],
      [RelevantCommentKind.isInversifyImport]: [],
      [RelevantCommentKind.shiftLineSpaces2]: [],
    },
    list: [],
  };

  /*
   * Do not visit the source file node.
   * A source file node has two children: a root node and an end of file token node.
   * Visit grandchildren nodes so that the root node is not visited.
   */
  for (const childNode of sourceFileNode.getChildren()) {
    for (const granchildNode of childNode.getChildren()) {
      visitRelevantCommentPositions(
        sourceFileNode,
        fileContent,
        granchildNode,
        positions,
      );
    }
  }

  // Visit the end of file token node.
  visitRelevantCommentPositions(
    sourceFileNode,
    fileContent,
    sourceFileNode.endOfFileToken,
    positions,
  );

  return positions;
}
