import { afterEach, describe, expect, it, vitest } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ThemeProvider } from '../theme/ThemeProvider.js';
import { ExecutionPage } from './ExecutionPage.js';

describe(ExecutionPage, () => {
  afterEach(() => {
    cleanup();
    vitest.restoreAllMocks();
  });

  describe('having an execution without controller, middlewares, or interceptors', () => {
    describe('when rendered', () => {
      it('should show the request and disable empty sections', async () => {
        mockExecution(executionPayload());
        renderPage();

        expect(
          await screen.findByRole('heading', { name: '/users' }),
        ).toBeTruthy();
        expect(screen.getByTitle('201 Created').textContent).toBe(
          '201 Created',
        );
        expect(
          screen.getByRole('tab', { name: 'Timeline', selected: true }),
        ).toBeTruthy();
        expect(
          screen.getByRole('img', { name: 'Timing waterfall' }),
        ).toBeTruthy();
        expect(screen.getByText('AuthGuard')).toBeTruthy();

        fireEvent.click(screen.getByRole('tab', { name: 'Request' }));

        expect(screen.getByRole('rowheader', { name: 'accept' })).toBeTruthy();
        expect(
          screen
            .getByRole('tab', { name: 'Middlewares' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen
            .getByRole('tab', { name: 'Controller' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen
            .getByRole('tab', { name: 'Interceptors' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen.getByRole('tab', { name: 'Guards' }).hasAttribute('disabled'),
        ).toBe(false);

        fireEvent.click(screen.getByRole('tab', { name: 'Guards' }));

        expect(screen.getByText('AuthGuard')).toBeTruthy();
        expect(screen.getByText('Allowed')).toBeTruthy();

        fireEvent.click(screen.getByRole('tab', { name: 'Response' }));

        expect(
          screen.getByRole('rowheader', { name: 'content-type' }),
        ).toBeTruthy();
      });
    });
  });

  describe('having a missing execution', () => {
    describe('when rendered', () => {
      it('should show a not found message', async () => {
        vitest.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response(null, {
            status: 404,
          }),
        );
        renderPage();

        expect(
          await screen.findByText('This execution was not found.'),
        ).toBeTruthy();
      });
    });
  });
});

function mockExecution(payload: unknown): void {
  vitest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(payload), {
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
    }),
  );
}

function renderPage(): void {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const page: ReactElement = (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/executions/execution-1']}>
          <Routes>
            <Route
              element={<ExecutionPage />}
              path="/executions/:executionId"
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );

  render(page);
}

function executionPayload(): unknown {
  return {
    controller: null,
    guards: [
      {
        allowed: true,
        endedAt: '2026-10-19T20:00:00.006Z',
        error: null,
        guard: 'AuthGuard',
        id: 'guard-1',
        startedAt: '2026-10-19T20:00:00.002Z',
      },
    ],
    httpErrors: [],
    id: 'execution-1',
    interceptors: [],
    middlewares: [],
    nativeMiddlewares: [],
    pipes: [],
    request: {
      headers: {
        accept: 'application/json',
      },
      id: 'request-1',
      method: 'POST',
      startedAt: '2026-10-19T20:00:00.000Z',
      url: '/users',
    },
    response: {
      aborted: false,
      headers: {
        'content-type': 'application/json',
      },
      id: 'response-1',
      sentAt: '2026-10-19T20:00:00.018Z',
      statusCode: 201,
    },
  };
}
