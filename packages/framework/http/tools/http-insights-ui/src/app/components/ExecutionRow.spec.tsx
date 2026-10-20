import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { ExecutionRow } from './ExecutionRow.js';

describe(ExecutionRow, () => {
  describe('having a recorded execution', () => {
    describe('when rendered', () => {
      it('should show the method, URL, and duration', () => {
        render(
          <table>
            <tbody>
              <ExecutionRow
                execution={{
                  durationMs: 1284,
                  id: 'execution-1',
                  method: 'get',
                  url: '/users',
                }}
              />
            </tbody>
          </table>,
        );

        expect(screen.getByText('GET')).toBeTruthy();
        expect(screen.getByText('/users')).toBeTruthy();
        expect(screen.getByText('1,284')).toBeTruthy();
        expect(screen.getByText('ms')).toBeTruthy();
      });
    });
  });
});
