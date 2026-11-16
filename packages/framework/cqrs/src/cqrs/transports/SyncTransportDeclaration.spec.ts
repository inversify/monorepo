import { beforeAll, describe, expect, it } from 'vitest';

import { SyncTransportDeclaration } from './SyncTransportDeclaration.js';
import { syncTransportIdentifier } from './SyncTransportProvider.js';

describe(SyncTransportDeclaration, () => {
  describe('constructor', () => {
    describe('when called', () => {
      let declaration: SyncTransportDeclaration;

      beforeAll(() => {
        declaration = new SyncTransportDeclaration();
      });

      it('should set the sync transport identifier', () => {
        expect(declaration.identifier).toBe(syncTransportIdentifier);
      });
    });
  });
});
