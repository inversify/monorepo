import type ts from 'typescript';

export enum RelevantCommentKind {
  begin,
  end,
  exclude,
  isInversifyImport,
  shiftLineSpaces2,
}

export interface RelevantCommentPosition<
  TKind extends RelevantCommentKind = RelevantCommentKind,
> {
  kind: TKind;
  node: ts.Node;
  range: ts.CommentRange;
}

export interface RelevantCommentPositions {
  kindToPositionsMap: {
    [TKind in RelevantCommentKind]: RelevantCommentPosition<TKind>[];
  };
  list: RelevantCommentPosition[];
}

export interface ReplaceRange {
  deleteRange: [number, number];
  replacement: string | ((text: string) => string) | undefined;
}
