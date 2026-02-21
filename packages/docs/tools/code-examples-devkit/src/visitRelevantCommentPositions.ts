import ts from 'typescript';

import {
  RelevantCommentKind,
  type RelevantCommentPosition,
  type RelevantCommentPositions,
} from './types.js';

const BEGIN_EXAMPLE_COMMENT: string = '// Begin-example';
const END_EXAMPLE_COMMENT: string = '// End-example';
const EXCLUDE_FROM_EXAMPLE_COMMENT: string = '// Exclude-from-example';
const IS_INVERSIFY_IMPORT_EXAMPLE_COMMENT: string =
  '// Is-inversify-import-example';
const SHIFT_LINES_SPACES_2_COMMENT: string = '// Shift-line-spaces-2';

const commentToRelevantCommentKindMap: {
  [key: string]: RelevantCommentKind;
} = {
  [BEGIN_EXAMPLE_COMMENT]: RelevantCommentKind.begin,
  [END_EXAMPLE_COMMENT]: RelevantCommentKind.end,
  [EXCLUDE_FROM_EXAMPLE_COMMENT]: RelevantCommentKind.exclude,
  [IS_INVERSIFY_IMPORT_EXAMPLE_COMMENT]: RelevantCommentKind.isInversifyImport,
  [SHIFT_LINES_SPACES_2_COMMENT]: RelevantCommentKind.shiftLineSpaces2,
};

export default function visitRelevantCommentPositions(
  sourceFileNode: ts.SourceFile,
  fileContent: string,
  node: ts.Node,
  positions: RelevantCommentPositions,
): void {
  for (const comment of ts.getLeadingCommentRanges(
    fileContent,
    node.getFullStart(),
  ) ?? []) {
    const commentContent: string = fileContent.substring(
      comment.pos,
      comment.end,
    );

    const relevanCommentKind: RelevantCommentKind | undefined =
      commentToRelevantCommentKindMap[commentContent];

    if (relevanCommentKind !== undefined) {
      const relevantCommentPosition: RelevantCommentPosition = {
        kind: relevanCommentKind,
        node,
        range: comment,
      };

      const kindToPositionsMapEntry: RelevantCommentPosition[] = (
        positions.kindToPositionsMap as Record<
          RelevantCommentKind,
          RelevantCommentPosition[]
        >
      )[relevanCommentKind];

      const lastKindToPositionsMapEntry: RelevantCommentPosition | undefined =
        kindToPositionsMapEntry[kindToPositionsMapEntry.length - 1];

      if (
        lastKindToPositionsMapEntry === undefined ||
        lastKindToPositionsMapEntry.range.pos !==
          relevantCommentPosition.range.pos
      ) {
        kindToPositionsMapEntry.push(relevantCommentPosition);
        positions.list.push(relevantCommentPosition);
      }
    }
  }

  for (const childNode of node.getChildren(sourceFileNode)) {
    visitRelevantCommentPositions(
      sourceFileNode,
      fileContent,
      childNode,
      positions,
    );
  }
}
