import type ts from 'typescript';

import {
  RelevantCommentKind,
  type RelevantCommentPosition,
  type RelevantCommentPositions,
  type ReplaceRange,
} from './types.js';

const NODE_IMPORT_REXEP: RegExp = /^(.*)(import.*)(['"])([^'"]+)(['"])(.*)$/gms;
const INVERSIFY_NODE_IMPORT_REPLACE: string = '$2$3inversify$5$6';

export default function getReplaceRanges(
  sourceFile: ts.SourceFile,
  positions: RelevantCommentPositions,
): ReplaceRange[] {
  const [firstBeginOfExamplePosition]: RelevantCommentPosition[] =
    positions.kindToPositionsMap[RelevantCommentKind.begin];

  const lastEndOfExamplePosition: RelevantCommentPosition | undefined =
    positions.kindToPositionsMap[RelevantCommentKind.end].at(-1);

  const replaceRanges: ReplaceRange[] = [];

  const relevantCommentPositions: RelevantCommentPosition[] = positions.list;

  let index: number = 0;

  // 1. Iterate until the first begin example comment is found in case there's at least one.
  if (firstBeginOfExamplePosition !== undefined) {
    while (relevantCommentPositions[index] !== firstBeginOfExamplePosition) {
      ++index;
    }

    replaceRanges.push({
      deleteRange: [
        0,
        firstBeginOfExamplePosition.node.getStart(sourceFile, true),
      ],
      replacement: undefined,
    });

    ++index;
  }

  // 2. Iterate over the rest of the relevant comments until the last end of example comment is found, if any.
  while (index < relevantCommentPositions.length) {
    const currentRelevantCommentPosition: RelevantCommentPosition =
      relevantCommentPositions[index] as RelevantCommentPosition;

    switch (currentRelevantCommentPosition.kind) {
      case RelevantCommentKind.end:
        if (currentRelevantCommentPosition === lastEndOfExamplePosition) {
          replaceRanges.push({
            deleteRange: [lastEndOfExamplePosition.node.pos, sourceFile.end],
            replacement: undefined,
          });

          return replaceRanges;
        }

        break;
      case RelevantCommentKind.exclude:
        replaceRanges.push({
          deleteRange: [
            currentRelevantCommentPosition.node.pos,
            currentRelevantCommentPosition.node.end,
          ],
          replacement: undefined,
        });
        break;
      case RelevantCommentKind.isInversifyImport:
        replaceRanges.push({
          deleteRange: [
            currentRelevantCommentPosition.node.pos,
            currentRelevantCommentPosition.node.end,
          ],
          replacement: (text: string) =>
            text.replace(NODE_IMPORT_REXEP, INVERSIFY_NODE_IMPORT_REPLACE),
        });
        break;
      default:
    }

    ++index;
  }

  return replaceRanges;
}
