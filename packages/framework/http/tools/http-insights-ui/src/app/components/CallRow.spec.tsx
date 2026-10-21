import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { CallRow } from './CallRow.js';

describe(CallRow, () => {
  describe('having a recorded call', () => {
    describe('when rendered', () => {
      it('should show the method, URL, status, and duration', () => {
        render(
          <MemoryRouter>
            <table>
              <tbody>
                <CallRow
                  call={{
                    durationMs: 1284,
                    id: 'call-1',
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
        ).toBe('/calls/call-1');
        expect(screen.getByTitle('200 OK').textContent).toBe('200 OK');
        expect(screen.getByText('1,284')).toBeTruthy();
        expect(screen.getByText('ms')).toBeTruthy();
      });
    });
  });
});
