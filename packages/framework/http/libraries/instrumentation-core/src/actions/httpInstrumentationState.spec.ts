import { describe, expect, it } from 'vitest';

import { type HttpInstrumentationScope } from '../models/HttpInstrumentationScope.js';
import {
  closeHttpInstrumentationScope,
  initializeHttpInstrumentationRequest,
  openHttpInstrumentationScope,
} from './httpInstrumentationState.js';

describe(openHttpInstrumentationScope, () => {
  describe('having a request with a nested execution', () => {
    describe('when called', () => {
      it('should parent the inner scope to the outer execution', () => {
        const request: object = {};

        initializeHttpInstrumentationRequest(request, 'request-1');

        const outer: HttpInstrumentationScope = openHttpInstrumentationScope(
          request,
          'execution-outer',
        );
        const inner: HttpInstrumentationScope = openHttpInstrumentationScope(
          request,
          'execution-inner',
        );

        expect(outer).toStrictEqual({
          executionId: 'execution-outer',
          parentExecutionId: undefined,
          requestId: 'request-1',
        });
        expect(inner).toStrictEqual({
          executionId: 'execution-inner',
          parentExecutionId: 'execution-outer',
          requestId: 'request-1',
        });

        closeHttpInstrumentationScope(request, inner.executionId);

        const sibling: HttpInstrumentationScope = openHttpInstrumentationScope(
          request,
          'execution-sibling',
        );

        expect(sibling.parentExecutionId).toBe('execution-outer');
      });
    });
  });
});
