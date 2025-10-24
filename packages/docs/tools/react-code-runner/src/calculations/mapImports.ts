import type { NodePath, PluginObj } from '@babel/core';
import { packages } from '@babel/standalone';
import type * as types from '@babel/types';

export function mapImports(
  importMappings: Record<string, string>,
): () => PluginObj {
  return (): PluginObj => {
    return {
      visitor: {
        ImportDeclaration(path: NodePath<types.ImportDeclaration>) {
          const source: string = path.node.source.value;
          const mappedPath: string | undefined = importMappings[source];

          if (mappedPath !== undefined) {
            path.node.source = packages.types.stringLiteral(mappedPath);
          }
        },
      },
    };
  };
}
