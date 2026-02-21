import type ts from 'typescript';

import getReplaceRanges from './getReplaceRanges.js';
import shift from './shift.js';
import {
  RelevantCommentKind,
  type RelevantCommentPositions,
  type ReplaceRange,
} from './types.js';

const SHIFT_LINES_SPACES_2_OFFSET: number = 2;

export default function transformSourceFile(
  sourceFile: ts.SourceFile,
  positions: RelevantCommentPositions,
): string {
  const replaceRanges: ReplaceRange[] = getReplaceRanges(sourceFile, positions);
  const shiftOffset: number = getShiftOffet(positions);

  let transformedSourceCode: string = '';
  let currentIndex: number = 0;

  for (const {
    deleteRange: [min, max],
    replacement,
  } of replaceRanges) {
    while (currentIndex < max) {
      if (currentIndex < min) {
        transformedSourceCode += sourceFile.text[currentIndex];
      }

      ++currentIndex;
    }

    if (replacement !== undefined) {
      transformedSourceCode +=
        replacement instanceof Function
          ? replacement(sourceFile.text.slice(min, max))
          : replacement;
    }
  }

  transformedSourceCode += sourceFile.text.slice(currentIndex);

  return shift(shiftOffset, transformedSourceCode);
}

function getShiftOffet(positions: RelevantCommentPositions): number {
  let shiftOffset: number = 0;

  if (
    positions.kindToPositionsMap[RelevantCommentKind.shiftLineSpaces2].length >
    0
  ) {
    shiftOffset = SHIFT_LINES_SPACES_2_OFFSET;
  }

  return shiftOffset;
}
