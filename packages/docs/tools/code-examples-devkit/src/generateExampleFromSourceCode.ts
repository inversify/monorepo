import fs from 'node:fs/promises';
import path from 'node:path';

import ts from 'typescript';

import findRelevantCommentPositions from './findRelevantCommentPositions.js';
import transformSourceFile from './transformSourceFile.js';
import { type RelevantCommentPositions } from './types.js';

export default async function generateExampleFromSourceCode(
  sourcePath: string,
): Promise<string> {
  const fileContent: string = (await fs.readFile(sourcePath)).toString();

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    path.basename(sourcePath),
    fileContent,
    ts.ScriptTarget.Latest,
  );

  const relevantCommentPositions: RelevantCommentPositions =
    findRelevantCommentPositions(fileContent, sourceFile);

  return transformSourceFile(sourceFile, relevantCommentPositions);
}
