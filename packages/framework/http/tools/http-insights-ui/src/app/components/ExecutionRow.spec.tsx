import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { ExecutionRow } from './ExecutionRow.js';

describe(ExecutionRow, () => {
  describe('having a recorded execution', () => {
    describe('when rendered', () => {
      it('should show the method, URL, status, and duration', () => {
        render(
          <MemoryRouter>
            <table>
              <tbody>
                <ExecutionRow
                  execution={{
                    durationMs: 1284,
                    id: 'execution-1',
                    method: 'get',
                    statusCode: 200,
                    url: '/users',
                  }}
                />
              </tbody>
            </table>
          </MemoryRouter>,
        );

        expect(screen.getByText('GET')).toBeTruthy();
        expect(
          screen.getByRole('link', { name: '/users' }).getAttribute('href'),
        ).toBe('/executions/execution-1');
        expect(screen.getByTitle('200 OK').textContent).toBe('200 OK');
        expect(screen.getByText('1,284')).toBeTruthy();
        expect(screen.getByText('ms')).toBeTruthy();
      });
    });
  });
});
