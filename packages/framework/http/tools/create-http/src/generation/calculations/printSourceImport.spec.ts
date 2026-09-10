import { beforeAll, describe, expect, it } from 'vitest';

import { type SourceImport } from '../models/BootstrapSourceModel.js';
import { printSourceImport } from './printSourceImport.js';

describe(printSourceImport, () => {
  describe('having a value named import', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        const sourceImport: SourceImport = {
          moduleSpecifier: '../models/StatusV1.js',
          namedImports: [{ name: 'StatusV1' }],
        };

        result = printSourceImport(sourceImport);
      });

      it('should print a value import', () => {
        expect(result).toBe(
          "import { StatusV1 } from '../models/StatusV1.js';",
        );
      });
    });
  });

  describe('having a type-only import', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        const sourceImport: SourceImport = {
          isTypeOnly: true,
          moduleSpecifier: '../../../generated/api/index.js',
          namedImports: [{ name: 'TodoV1' }],
        };

        result = printSourceImport(sourceImport);
      });

      it('should print an import type declaration', () => {
        expect(result).toBe(
          "import type { TodoV1 } from '../../../generated/api/index.js';",
        );
      });
    });
  });
});
