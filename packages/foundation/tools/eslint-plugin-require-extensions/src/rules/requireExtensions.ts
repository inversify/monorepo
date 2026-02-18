import { existsSync, lstatSync } from 'node:fs';
import path from 'node:path';

import type { Rule } from 'eslint';

/**
 * Represents an identifier in the AST.
 */
interface Identifier {
  name: string;
  type: 'Identifier';
}

/**
 * Represents a string literal in the AST.
 */
interface StringLiteral {
  type: 'Literal';
  value: string;
}

/**
 * Represents an import specifier (e.g., `{ foo }` or `{ foo as bar }`).
 */
interface ImportSpecifier {
  imported: Identifier;
  local: Identifier;
  type: 'ImportSpecifier';
}

/**
 * Represents a default import specifier (e.g., `foo` in `import foo from ...`).
 */
interface ImportDefaultSpecifier {
  local: Identifier;
  type: 'ImportDefaultSpecifier';
}

/**
 * Represents a namespace import specifier (e.g., `* as foo`).
 */
interface ImportNamespaceSpecifier {
  local: Identifier;
  type: 'ImportNamespaceSpecifier';
}

/**
 * Represents an export specifier (e.g., `{ foo }` or `{ foo as bar }`).
 */
interface ExportSpecifier {
  exported: Identifier;
  local: Identifier;
  type: 'ExportSpecifier';
}

type ImportSpecifierNode =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier;

/**
 * Represents an import declaration node.
 */
interface ImportDeclarationNode {
  importKind?: 'type' | 'value';
  source: StringLiteral;
  specifiers: ImportSpecifierNode[];
  type: 'ImportDeclaration';
}

/**
 * Represents a named export declaration with a source.
 */
interface ExportNamedDeclarationNode {
  exportKind?: 'type' | 'value';
  source: StringLiteral;
  specifiers: ExportSpecifier[];
  type: 'ExportNamedDeclaration';
}

/**
 * Represents an export all declaration (e.g., `export * from ...`).
 */
interface ExportAllDeclarationNode {
  exported: Identifier | null;
  exportKind?: 'type' | 'value';
  source: StringLiteral;
  type: 'ExportAllDeclaration';
}

/**
 * Represents a dynamic import expression (e.g., `import('./foo')`).
 */
interface ImportExpressionNode {
  source: StringLiteral;
  type: 'ImportExpression';
}

/**
 * Union of all node types that have a source property we care about.
 */
type NodeWithSource =
  | ExportAllDeclarationNode
  | ExportNamedDeclarationNode
  | ImportDeclarationNode
  | ImportExpressionNode;

/**
 * Known extensions that TypeScript compiles to equivalent JS extensions.
 * Maps from the extension to check to what it should become in the output.
 */
const EXTENSION_MAP: Record<string, string> = {
  '.cjs': '.cjs',
  '.cts': '.cjs',
  '.js': '.js',
  '.json': '.json',
  '.jsx': '.js',
  '.mjs': '.mjs',
  '.mts': '.mjs',
  '.ts': '.js',
  '.tsx': '.js',
};

/**
 * Extensions to try when resolving a path without extension.
 * Order matters - we try more specific extensions first.
 */
const RESOLVABLE_EXTENSIONS: string[] = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.json',
];

/**
 * Given a file path without extension, finds the actual file and returns the
 * appropriate extension that should be used in the import/export statement.
 *
 * @param basePath - The file path without extension
 * @returns The extension to use (e.g., '.js', '.mjs') or undefined if not found
 */
function findExtension(basePath: string): string | undefined {
  for (const ext of RESOLVABLE_EXTENSIONS) {
    if (existsSync(basePath + ext)) {
      return EXTENSION_MAP[ext];
    }
  }
  return undefined;
}

/**
 * Checks if a path points to a directory.
 */
function isDirectory(filePath: string): boolean {
  return existsSync(filePath) && lstatSync(filePath).isDirectory();
}

/**
 * Extracts the value from a source, handling query strings.
 * Returns the path portion before any query string.
 */
function extractPathValue(value: string): string {
  return value.replace(/\?.*$/, '');
}

/**
 * Checks if a value is a relative path.
 */
function isRelativePath(value: string): boolean {
  return value.startsWith('.');
}

/**
 * Checks if a value already has an extension.
 */
function hasExtension(value: string): boolean {
  const ext: string = path.extname(value);
  return ext !== '' && EXTENSION_MAP[ext] !== undefined;
}

/**
 * Type guard to check if a node is an ImportDeclaration.
 */
function isImportDeclaration(
  node: Rule.Node,
): node is ImportDeclarationNode & Rule.Node {
  return node.type === 'ImportDeclaration';
}

/**
 * Type guard to check if a node is an ExportNamedDeclaration with a source.
 */
function isExportNamedDeclaration(
  node: Rule.Node,
): node is ExportNamedDeclarationNode & Rule.Node {
  return (
    node.type === 'ExportNamedDeclaration' &&
    'source' in node &&
    node.source !== null
  );
}

/**
 * Type guard to check if a node is an ExportAllDeclaration.
 */
function isExportAllDeclaration(
  node: Rule.Node,
): node is ExportAllDeclarationNode & Rule.Node {
  return node.type === 'ExportAllDeclaration';
}

/**
 * Type guard to check if a node is an ImportExpression with a string literal source.
 */
function isImportExpression(
  node: Rule.Node,
): node is ImportExpressionNode & Rule.Node {
  if (node.type !== 'ImportExpression') {
    return false;
  }

  return (
    typeof node.source === 'object' &&
    'type' in node.source &&
    node.source.type === 'Literal' &&
    'value' in node.source &&
    typeof node.source.value === 'string'
  );
}

/**
 * Extracts the source value from a node with source property.
 */
function getSourceValue(node: NodeWithSource): string {
  return node.source.value;
}

/**
 * Creates a rule that processes import/export declarations.
 */
function createRule(
  check: (
    context: Rule.RuleContext,
    node: NodeWithSource & Rule.Node,
    resolvedPath: string,
  ) => void,
): Rule.RuleModule {
  return {
    create(context: Rule.RuleContext): Rule.RuleListener {
      function processNode(node: Rule.Node): void {
        let sourceValue: string;

        if (isImportDeclaration(node)) {
          sourceValue = node.source.value;
        } else if (isExportNamedDeclaration(node)) {
          sourceValue = node.source.value;
        } else if (isExportAllDeclaration(node)) {
          sourceValue = node.source.value;
        } else if (isImportExpression(node)) {
          sourceValue = node.source.value;
        } else {
          return;
        }

        const pathValue: string = extractPathValue(sourceValue);

        if (!pathValue || !isRelativePath(pathValue)) {
          return;
        }

        const filename: string = context.filename;
        const resolvedPath: string = path.resolve(
          path.dirname(filename),
          pathValue,
        );

        check(context, node as NodeWithSource & Rule.Node, resolvedPath);
      }

      return {
        ExportAllDeclaration: processNode,
        ExportNamedDeclaration: processNode,
        ImportDeclaration: processNode,
        ImportExpression: processNode,
      };
    },
    meta: {
      fixable: 'code',
      schema: [],
      type: 'problem',
    },
  };
}

/**
 * Builds replacement text for an import declaration.
 */
function buildImportDeclarationText(
  node: ImportDeclarationNode,
  newSourceValue: string,
): string {
  const specifiers: ImportSpecifierNode[] = node.specifiers;

  if (specifiers.length === 0) {
    return `import '${newSourceValue}';`;
  }

  const importKind: 'type' | 'value' = node.importKind ?? 'value';
  const typePrefix: string = importKind === 'type' ? 'type ' : '';

  const defaultSpecifier: ImportDefaultSpecifier | undefined = specifiers.find(
    (s: ImportSpecifierNode): s is ImportDefaultSpecifier =>
      s.type === 'ImportDefaultSpecifier',
  );

  const namespaceSpecifier: ImportNamespaceSpecifier | undefined =
    specifiers.find(
      (s: ImportSpecifierNode): s is ImportNamespaceSpecifier =>
        s.type === 'ImportNamespaceSpecifier',
    );

  const namedSpecifiers: ImportSpecifier[] = specifiers.filter(
    (s: ImportSpecifierNode): s is ImportSpecifier =>
      s.type === 'ImportSpecifier',
  );

  let importClause: string = '';

  if (defaultSpecifier != null) {
    importClause = defaultSpecifier.local.name;
    if (namedSpecifiers.length > 0) {
      const namedParts: string[] = namedSpecifiers.map(formatImportSpecifier);
      importClause += `, { ${namedParts.join(', ')} }`;
    }
  } else if (namespaceSpecifier != null) {
    importClause = `* as ${namespaceSpecifier.local.name}`;
  } else if (namedSpecifiers.length > 0) {
    const namedParts: string[] = namedSpecifiers.map(formatImportSpecifier);
    importClause = `{ ${namedParts.join(', ')} }`;
  }

  return `import ${typePrefix}${importClause} from '${newSourceValue}';`;
}

/**
 * Formats a single import specifier.
 */
function formatImportSpecifier(specifier: ImportSpecifier): string {
  const importedName: string = specifier.imported.name;
  const localName: string = specifier.local.name;

  if (importedName !== localName) {
    return `${importedName} as ${localName}`;
  }
  return localName;
}

/**
 * Builds replacement text for a named export declaration.
 */
function buildExportNamedDeclarationText(
  node: ExportNamedDeclarationNode,
  newSourceValue: string,
): string {
  const specifiers: ExportSpecifier[] = node.specifiers;
  const exportKind: 'type' | 'value' = node.exportKind ?? 'value';
  const typePrefix: string = exportKind === 'type' ? 'type ' : '';

  if (specifiers.length === 0) {
    return `export {} from '${newSourceValue}';`;
  }

  const specifierTexts: string[] = specifiers.map(formatExportSpecifier);
  return `export ${typePrefix}{ ${specifierTexts.join(', ')} } from '${newSourceValue}';`;
}

/**
 * Formats a single export specifier.
 */
function formatExportSpecifier(specifier: ExportSpecifier): string {
  const localName: string = specifier.local.name;
  const exportedName: string = specifier.exported.name;

  if (localName !== exportedName) {
    return `${localName} as ${exportedName}`;
  }
  return localName;
}

/**
 * Builds replacement text for an export all declaration.
 */
function buildExportAllDeclarationText(
  node: ExportAllDeclarationNode,
  newSourceValue: string,
): string {
  const exported: Identifier | null = node.exported;
  const exportKind: 'type' | 'value' = node.exportKind ?? 'value';
  const typePrefix: string = exportKind === 'type' ? 'type ' : '';

  if (exported !== null) {
    return `export ${typePrefix}* as ${exported.name} from '${newSourceValue}';`;
  }
  return `export ${typePrefix}* from '${newSourceValue}';`;
}

/**
 * Builds the replacement text for a node with a new source value.
 */
function buildReplacementText(
  node: NodeWithSource & Rule.Node,
  newSourceValue: string,
): string {
  switch (node.type) {
    case 'ImportDeclaration':
      return buildImportDeclarationText(node, newSourceValue);
    case 'ExportNamedDeclaration':
      return buildExportNamedDeclarationText(node, newSourceValue);
    case 'ExportAllDeclaration':
      return buildExportAllDeclarationText(node, newSourceValue);
    case 'ImportExpression':
      return `import('${newSourceValue}')`;
  }
}

/**
 * Rule: require-extensions
 *
 * Ensures that relative imports and exports include a file extension.
 * Determines the correct extension based on the actual source file type.
 */
export const requireExtensions: Rule.RuleModule = createRule(
  (
    context: Rule.RuleContext,
    node: NodeWithSource & Rule.Node,
    resolvedPath: string,
  ): void => {
    const sourceValue: string = getSourceValue(node);
    const pathValue: string = extractPathValue(sourceValue);

    // Skip if already has a known extension
    if (hasExtension(pathValue)) {
      return;
    }

    // Skip if it resolves to a directory (handled by require-index rule)
    if (isDirectory(resolvedPath)) {
      return;
    }

    // Find the appropriate extension
    const extension: string | undefined = findExtension(resolvedPath);

    if (extension != null) {
      context.report({
        fix(fixer: Rule.RuleFixer): Rule.Fix | null {
          if (sourceValue.includes('?')) {
            return null;
          }
          return fixer.replaceText(
            node,
            buildReplacementText(node, `${sourceValue}${extension}`),
          );
        },
        message: `Relative imports and exports must end with ${extension}`,
        node,
      });
    } else {
      context.report({
        fix(fixer: Rule.RuleFixer): Rule.Fix | null {
          if (sourceValue.includes('?')) {
            return null;
          }
          return fixer.replaceText(
            node,
            buildReplacementText(node, `${sourceValue}.js`),
          );
        },
        message: 'Relative imports and exports must end with .js',
        node,
      });
    }
  },
);

/**
 * Rule: require-index
 *
 * Ensures that imports/exports pointing to directories include /index.js.
 */
export const requireIndex: Rule.RuleModule = createRule(
  (
    context: Rule.RuleContext,
    node: NodeWithSource & Rule.Node,
    resolvedPath: string,
  ): void => {
    if (!isDirectory(resolvedPath)) {
      return;
    }

    const sourceValue: string = getSourceValue(node);
    const indexPath: string = path.join(resolvedPath, 'index');
    const extension: string = findExtension(indexPath) ?? '.js';

    const newValue: string = sourceValue.endsWith('/')
      ? `${sourceValue}index${extension}`
      : `${sourceValue}/index${extension}`;

    context.report({
      fix(fixer: Rule.RuleFixer): Rule.Fix {
        return fixer.replaceText(node, buildReplacementText(node, newValue));
      },
      message: `Directory imports must end with /index${extension}`,
      node,
    });
  },
);
