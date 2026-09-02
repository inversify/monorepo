const TYPESCRIPT_RESERVED_WORDS: Set<string> = new Set([
  'abstract',
  'any',
  'as',
  'asserts',
  'async',
  'await',
  'boolean',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'infer',
  'instanceof',
  'interface',
  'is',
  'keyof',
  'let',
  'module',
  'namespace',
  'never',
  'new',
  'null',
  'number',
  'object',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'satisfies',
  'set',
  'static',
  'string',
  'super',
  'switch',
  'symbol',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'unique',
  'unknown',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

export function isTypeScriptIdentifierSyntax(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

export function toTypeScriptIdentifier(value: string): string {
  let identifier: string = value.replace(/[^A-Za-z0-9_$]/g, '_');

  if (identifier.length === 0 || !/^[A-Za-z_$]/.test(identifier)) {
    identifier = `_${identifier}`;
  }

  if (TYPESCRIPT_RESERVED_WORDS.has(identifier)) {
    identifier = `_${identifier}`;
  }

  return identifier;
}
