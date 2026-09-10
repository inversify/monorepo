import { beforeAll, describe, expect, it } from 'vitest';

import { toImportDeclarationStructure } from './toImportDeclarationStructure.js';

describe(toImportDeclarationStructure, () => {
  describe('having a named import with an alias and type-only flags', () => {
    describe('when called', () => {
      let result: ReturnType<typeof toImportDeclarationStructure>;

      beforeAll(() => {
        result = toImportDeclarationStructure({
          isTypeOnly: true,
          moduleSpecifier: 'express',
          namedImports: [
            {
              alias: 'ExpressApplication',
              isTypeOnly: true,
              name: 'Application',
            },
          ],
        });
      });

      it('should map source import fields onto a ts-morph import declaration', () => {
        expect(result).toStrictEqual({
          isTypeOnly: true,
          moduleSpecifier: 'express',
          namedImports: [
            {
              alias: 'ExpressApplication',
              isTypeOnly: true,
              name: 'Application',
            },
          ],
        });
      });
    });
  });

  describe('having a default import and a namespace import', () => {
    describe('when called', () => {
      let result: ReturnType<typeof toImportDeclarationStructure>;

      beforeAll(() => {
        result = toImportDeclarationStructure({
          defaultImport: 'express',
          moduleSpecifier: 'express',
          namespaceImport: 'expressNs',
        });
      });

      it('should include default and namespace import fields', () => {
        expect(result).toStrictEqual({
          defaultImport: 'express',
          moduleSpecifier: 'express',
          namespaceImport: 'expressNs',
        });
      });
    });
  });
});
